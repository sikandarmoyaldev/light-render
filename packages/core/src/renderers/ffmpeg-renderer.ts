// Node.js native child process, file system, and crypto modules
import { spawn } from "child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Import core modules
import { Config } from "../core/config";
import { Layer } from "../core/layer";
import { Segment } from "../core/segment";

/**
 * Downloads an HTTP asset to a local temporary directory.
 * Implements SHA-256 hashing for automatic asset deduplication.
 */
async function downloadAsset(url: string, tempDir: string): Promise<string> {
    const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
    const localPath = path.join(tempDir, `${hash}.jpg`);

    if (existsSync(localPath)) {
        console.log(`[AssetManager] Cache hit for ${url}`);
        return localPath;
    }

    console.log(`[AssetManager] Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(localPath, buffer);
    return localPath;
}

/**
 * FFmpeg implementation of the base renderer.
 */
export class FfmpegRenderer {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    /**
     * Helper to extract filter snippets from layer properties (e.g., boxblur).
     * Excludes position strings (x=...:y=...) which are handled by the overlay filter.
     */
    private getPropertyFilters(layer: Layer): string {
        return Object.values(layer.properties)
            .map((p) =>
                p.calculateValue(
                    this.config.width,
                    this.config.height,
                    this.config.width,
                    this.config.height,
                ),
            )
            .filter((v) => typeof v === "string" && v.length > 0 && !v.startsWith("x="))
            .join(",");
    }

    async render(segments: Segment[], outputPath: string): Promise<void> {
        console.log(`[FfmpegRenderer] Starting render to ${outputPath}...`);

        const assetsDir = path.join(process.cwd(), "temp", "assets");
        if (!existsSync(assetsDir)) await mkdir(assetsDir, { recursive: true });

        for (const segment of segments) {
            for (const layer of segment.layers) {
                if (layer.src.startsWith("http://") || layer.src.startsWith("https://")) {
                    layer.src = await downloadAsset(layer.src, assetsDir);
                }
            }
        }

        const args: string[] = ["-y"];
        const filterParts: string[] = [];
        let inputIndex = 0;
        const segmentOutputs: string[] = [];

        for (const segment of segments) {
            const totalDuration = segment.duration;

            segment.layers.forEach((layer) => {
                if (layer.type === "image") {
                    args.push(
                        "-loop",
                        "1",
                        "-framerate",
                        this.config.fps.toString(),
                        "-i",
                        layer.src,
                    );
                } else {
                    args.push("-i", layer.src);
                }
            });

            let lastVideoLabel = `${inputIndex}:v`;

            segment.layers.forEach((layer, layerIndex) => {
                const currentIndex = inputIndex + layerIndex;

                // 1. Extract property filters (Blur, etc.)
                const propFilters = this.getPropertyFilters(layer);

                if (layerIndex === 0) {
                    // BACKGROUND LAYER
                    // Scale -> Pad -> Format -> Setsar -> [Properties like Blur]
                    let bgChain = `scale=${this.config.width}:${this.config.height}:force_original_aspect_ratio=decrease,pad=${this.config.width}:${this.config.height}:(ow-iw)/2:(oh-ih)/2:color=black@0,format=yuv420p,setsar=1`;

                    if (propFilters) bgChain += `,${propFilters}`;

                    const bgLabel = `bg_${currentIndex}`;
                    filterParts.push(`[${currentIndex}:v]${bgChain}[${bgLabel}]`);
                    lastVideoLabel = bgLabel;
                } else {
                    // FOREGROUND LAYER
                    let currentLabel = `${currentIndex}:v`;

                    // Apply Properties (Blur) BEFORE effects and overlay
                    if (propFilters) {
                        const propLabel = `prop_${currentIndex}`;
                        filterParts.push(`[${currentLabel}]${propFilters}[${propLabel}]`);
                        currentLabel = propLabel;
                    }

                    // Apply Effects (Zoom)
                    layer.effects.forEach((effect) => {
                        const effectFilter = effect.buildFilterString(
                            currentIndex,
                            totalDuration,
                            this.config.fps,
                        );
                        filterParts.push(effectFilter);
                        currentLabel = effectFilter.match(/\[([^\]]+)\]$/)?.[1] || currentLabel;
                    });

                    // Calculate Position for Overlay
                    let overlayPos: string | number = "x=0:y=0";
                    const posProp = layer.properties["position"];
                    if (posProp) {
                        overlayPos = posProp.calculateValue(
                            this.config.width,
                            this.config.height,
                            this.config.width,
                            this.config.height,
                        );
                    }

                    const nextLabel = `overlay_${currentIndex}`;
                    filterParts.push(
                        `[${lastVideoLabel}][${currentLabel}]overlay=${overlayPos}:format=auto,setsar=1[${nextLabel}]`,
                    );
                    lastVideoLabel = nextLabel;
                }
            });

            const segOutLabel = `seg_${segment.id}`;
            filterParts.push(
                `[${lastVideoLabel}]trim=duration=${totalDuration},setpts=PTS-STARTPTS[${segOutLabel}]`,
            );
            segmentOutputs.push(segOutLabel);
            inputIndex += segment.layers.length;
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
