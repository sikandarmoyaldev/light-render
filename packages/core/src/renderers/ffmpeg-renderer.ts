// Node.js native modules (only imported in Node environment)
import { spawn } from "child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Import core modules
import { Config } from "../core/config";
import { Layer } from "../core/layer";
import { Segment } from "../core/segment";
import type { FfmpegInputConfig } from "../elements/base";
import type { Renderer } from "../types/render";

async function downloadAsset(url: string, tempDir: string): Promise<string> {
    const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
    const localPath = path.join(tempDir, `${hash}.jpg`);

    if (existsSync(localPath)) return localPath;

    console.log(`[AssetManager] Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(localPath, buffer);
    return localPath;
}

/**
 * FFmpeg-based renderer for Node.js environments.
 * Implements the Renderer interface for backend-agnostic orchestration.
 */
export class FfmpegRenderer implements Renderer {
    public config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    /**
     * Check if FFmpeg is installed and available in the system PATH.
     */
    async isAvailable(): Promise<boolean> {
        try {
            const { execSync } = await import("child_process");
            execSync("ffmpeg -version", { stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    }

    private getPropertyFilters(layer: Layer): string {
        return Object.values(layer.properties)
            .map((p) => p.buildFfmpegFilterString())
            .filter((v) => typeof v === "string" && v.length > 0 && !v.startsWith("x="))
            .join(",");
    }

    async render(segments: Segment[], outputPath: string): Promise<void> {
        console.log(`[FfmpegRenderer] Starting render to ${outputPath}...`);

        const assetsDir = path.join(process.cwd(), "temp", "assets");
        if (!existsSync(assetsDir)) await mkdir(assetsDir, { recursive: true });

        // ✅ Download remote assets for image/video elements
        for (const segment of segments) {
            for (const layer of segment.layers) {
                if (layer.element.type === "image" || layer.element.type === "video") {
                    const src = (layer.element as any).src;
                    if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
                        (layer.element as any).src = await downloadAsset(src, assetsDir);
                    }
                }
            }
        }

        const args: string[] = ["-y"];
        const filterParts: string[] = [];
        let inputIndex = 0;
        const segmentOutputs: string[] = [];

        for (const segment of segments) {
            const totalDuration = segment.duration;

            // ✅ Calculate correct input indices for each layer
            // Only image/video layers consume input file indices
            const layerInputIndices: number[] = [];
            let currentInputIndex = inputIndex;

            for (const layer of segment.layers) {
                if (layer.element.type === "image" || layer.element.type === "video") {
                    layerInputIndices.push(currentInputIndex);
                    currentInputIndex++;
                } else {
                    layerInputIndices.push(-1); // Text elements don't use input indices
                }
            }

            // ✅ Collect input configs from all elements in this segment (now async)
            const layerConfigs: FfmpegInputConfig[] = await Promise.all(
                segment.layers.map((layer, index) =>
                    layer.element.getFfmpegInputConfig(
                        this.config.fps,
                        layerInputIndices[index], // ✅ Use correct input index
                        this.config.width,
                        this.config.height,
                        totalDuration,
                    ),
                ),
            );

            // ✅ Add input arguments (only for elements with input files)
            layerConfigs.forEach((config) => {
                if (config.inputArgs.length > 0) {
                    args.push(...config.inputArgs);
                }
            });

            // ✅ Add initial filters (for text elements that generate their own streams)
            layerConfigs.forEach((config) => {
                if (config.initialFilters.length > 0) {
                    filterParts.push(...config.initialFilters);
                }
            });

            const baseLabel = `base_${segment.id}`;
            filterParts.push(
                `color=c=black:s=${this.config.width}x${this.config.height}:r=${this.config.fps}[${baseLabel}]`,
            );
            let lastVideoLabel = baseLabel;

            // ✅ Process each layer using its element's output label
            segment.layers.forEach((layer, layerIndex) => {
                const config = layerConfigs[layerIndex];
                let currentLabel = config.outputStreamLabel; // ✅ Use element's label
                let effectCounter = 0;

                const propFilters = this.getPropertyFilters(layer);
                if (propFilters) {
                    const propLabel = `prop_${layerInputIndices[layerIndex] !== -1 ? layerInputIndices[layerIndex] : layerIndex}`;
                    filterParts.push(`[${currentLabel}]${propFilters}[${propLabel}]`);
                    currentLabel = propLabel;
                }

                layer.effects.forEach((effect) => {
                    const outLabel = `fx_${layerInputIndices[layerIndex] !== -1 ? layerInputIndices[layerIndex] : layerIndex}_${effectCounter++}`;
                    const effectFilter = effect.buildFfmpegFilterString(
                        currentLabel,
                        outLabel,
                        totalDuration,
                        this.config.fps,
                    );
                    filterParts.push(effectFilter);
                    currentLabel = outLabel;
                });

                let overlayPos: string | number = "x=(W-w)/2:y=(H-h)/2";
                const posProp = layer.properties["position"];
                if (posProp) {
                    overlayPos = posProp.buildFfmpegFilterString();
                }

                const nextLabel = `overlay_${segment.id}_${layerIndex}`;
                filterParts.push(
                    `[${lastVideoLabel}][${currentLabel}]overlay=${overlayPos}:format=auto,setsar=1[${nextLabel}]`,
                );
                lastVideoLabel = nextLabel;
            });

            const segOutLabel = `seg_${segment.id}`;
            filterParts.push(
                `[${lastVideoLabel}]trim=duration=${totalDuration},setpts=PTS-STARTPTS[${segOutLabel}]`,
            );
            segmentOutputs.push(segOutLabel);

            // ✅ FIX: Only increment inputIndex for layers that actually consume input files
            const layersWithInputs = segment.layers.filter(
                (layer) => layer.element.type === "image" || layer.element.type === "video",
            );
            inputIndex += layersWithInputs.length;
        }

        if (segmentOutputs.length > 1) {
            const concatInputs = segmentOutputs.map((label) => `[${label}]`).join("");
            filterParts.push(`${concatInputs}concat=n=${segmentOutputs.length}:v=1:a=0[final_out]`);
        }

        if (filterParts.length > 0) args.push("-filter_complex", filterParts.join(";"));

        if (segmentOutputs.length > 1) args.push("-map", "[final_out]");
        else if (segmentOutputs.length === 1) args.push("-map", `[${segmentOutputs[0]}]`);

        const videoCodec = this.config.codec === "h264" ? "libx264" : this.config.codec;
        args.push("-c:v", videoCodec, "-pix_fmt", "yuv420p", "-preset", "fast", outputPath);

        console.log(`[FfmpegRenderer] Executing: ffmpeg ${args.join(" ")}`);

        return new Promise((resolve, reject) => {
            const ffmpegProcess = spawn("ffmpeg", args);
            let errorOutput = "";

            ffmpegProcess.stderr.on("data", (data: Buffer) => {
                const message = data.toString();
                errorOutput += message;
                if (message.includes("frame=") || message.includes("time=")) {
                    console.log(`[FFmpeg]: ${message.trim().split("\r").pop()}`);
                }
            });

            ffmpegProcess.on("close", (code: number) => {
                if (code === 0) {
                    console.log("[FfmpegRenderer] Rendering finished successfully!");
                    resolve();
                } else {
                    const lines = errorOutput
                        .split("\n")
                        .filter((l) => l.trim())
                        .slice(-15);
                    console.error("[FFmpeg Error Details]:\n", lines.join("\n"));
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            ffmpegProcess.on("error", (err: Error) => {
                console.error("[FfmpegRenderer] Failed to start FFmpeg process:", err.message);
                reject(err);
            });
        });
    }
}
