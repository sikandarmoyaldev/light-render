// Node.js native child process, file system, and crypto modules
import { spawn } from "child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Import core modules
import { Config } from "../core/config";
import { Segment } from "../core/segment";

/**
 * Downloads an HTTP asset to a local temporary directory.
 * Implements SHA-256 hashing for automatic asset deduplication.
 */
async function downloadAsset(url: string, tempDir: string): Promise<string> {
    // Generate a short SHA-256 hash of the URL to use as the filename
    const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
    const localPath = path.join(tempDir, `${hash}.jpg`);

    // Skip download if file already exists (Deduplication!)
    if (existsSync(localPath)) {
        console.log(`[AssetManager] Cache hit for ${url}`);
        return localPath;
    }

    console.log(`[AssetManager] Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(localPath, buffer);
    return localPath;
}

/**
 * FFmpeg implementation of the base renderer.
 * Dynamically constructs complex filtergraphs for multi-layer, multi-segment compositing.
 */
export class FfmpegRenderer {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    /**
     * Renders an array of segments to a single output file.
     */
    async render(segments: Segment[], outputPath: string): Promise<void> {
        console.log(`[FfmpegRenderer] Starting render to ${outputPath}...`);

        // 0. Prepare local asset cache directory
        const assetsDir = path.join(process.cwd(), "temp", "assets");
        if (!existsSync(assetsDir)) {
            await mkdir(assetsDir, { recursive: true });
        }

        // Download all HTTP assets to local cache before building FFmpeg command
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

        // 1. Process each segment and build the massive filtergraph
        for (const segment of segments) {
            const totalDuration = segment.duration;

            // Add inputs for this segment's layers
            segment.layers.forEach((layer) => {
                if (layer.type === "image") {
                    // Local images only need loop and framerate
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

            // Build filtergraph for this segment's layers
            let lastVideoLabel = `${inputIndex}:v`;

            segment.layers.forEach((layer, layerIndex) => {
                const currentIndex = inputIndex + layerIndex;

                if (layerIndex === 0) {
                    // Background layer: "w-auto h-auto" behavior (object-fit: contain)
                    // 1. Scale down to fit within canvas while preserving aspect ratio
                    // 2. Pad with transparent black to center and fill canvas
                    filterParts.push(
                        `[${currentIndex}:v]scale=${this.config.width}:${this.config.height}:force_original_aspect_ratio=decrease,pad=${this.config.width}:${this.config.height}:(ow-iw)/2:(oh-ih)/2:color=black@0[bg_${currentIndex}]`,
                    );
                    lastVideoLabel = `bg_${currentIndex}`;
                } else {
                    // Foreground layer: apply effects, then overlay
                    let currentLabel = `${currentIndex}:v`;

                    layer.effects.forEach((effect) => {
                        const effectFilter = effect.buildFilterString(
                            currentIndex,
                            totalDuration,
                            this.config.fps,
                        );
                        filterParts.push(effectFilter);
                        currentLabel = effectFilter.match(/\[([^\]]+)\]$/)?.[1] || currentLabel;
                    });

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
                        `[${lastVideoLabel}][${currentLabel}]overlay=${overlayPos}:format=auto[${nextLabel}]`,
                    );
                    lastVideoLabel = nextLabel;
                }
            });

            // Apply duration limit and reset timestamps
            const segOutLabel = `seg_${segment.id}`;
            filterParts.push(
                `[${lastVideoLabel}]trim=duration=${totalDuration},setpts=PTS-STARTPTS[${segOutLabel}]`,
            );
            segmentOutputs.push(segOutLabel);

            inputIndex += segment.layers.length;
        }

        // 2. Concatenate all segments
        if (segmentOutputs.length > 1) {
            const concatInputs = segmentOutputs.map((label) => `[${label}]`).join("");
            filterParts.push(`${concatInputs}concat=n=${segmentOutputs.length}:v=1:a=0[final_out]`);
        }

        // 3. CRITICAL: Add filter complex FIRST, then map
        if (filterParts.length > 0) {
            args.push("-filter_complex", filterParts.join(";"));
        }

        if (segmentOutputs.length > 1) {
            args.push("-map", "[final_out]");
        } else if (segmentOutputs.length === 1) {
            args.push("-map", `[${segmentOutputs[0]}]`);
        }

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
