// Node.js native child process for spawning FFmpeg
import { spawn } from "child_process";

// Import core modules
import { Config } from "../core/config";
import { Segment } from "../core/segment";

/**
 * FFmpeg implementation of the base renderer.
 * Uses native child_process to execute FFmpeg directly,
 * bypassing the deprecated fluent-ffmpeg library for maximum performance and control.
 */
export class FfmpegRenderer {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    /**
     * Renders an array of segments to a single output file.
     * Generates a solid color test video to prove the native pipeline works.
     */
    async render(segments: Segment[], outputPath: string): Promise<void> {
        console.log(`[FfmpegRenderer] Starting render to ${outputPath}...`);

        // Calculate total duration from segments
        const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

        // Map config codec to FFmpeg encoder name
        const videoCodec = this.config.codec === "h264" ? "libx264" : this.config.codec;

        // Construct raw FFmpeg arguments
        // -y: Overwrite output without asking
        // -f lavfi -i color=...: Generate a solid color input
        // -t: Set duration
        const args = [
            "-y",
            "-f",
            "lavfi",
            "-i",
            `color=c=blue:s=${this.config.width}x${this.config.height}:r=${this.config.fps}`,
            "-t",
            totalDuration.toString(),
            "-c:v",
            videoCodec,
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "fast",
            outputPath,
        ];

        console.log(`[FfmpegRenderer] Executing: ffmpeg ${args.join(" ")}`);

        return new Promise((resolve, reject) => {
            // Spawn FFmpeg process natively
            // Note: If you get an ENOENT error on Windows, add { shell: true } as the 3rd argument
            const ffmpegProcess = spawn("ffmpeg", args);

            // Capture stderr (FFmpeg outputs progress and logs here)
            ffmpegProcess.stderr.on("data", (data: Buffer) => {
                const message = data.toString().trim();
                // Filter for progress lines to avoid console spam
                if (message.includes("frame=") || message.includes("time=")) {
                    console.log(`[FFmpeg]: ${message.split("\r").pop()}`);
                }
            });

            // Handle process completion
            ffmpegProcess.on("close", (code: number) => {
                if (code === 0) {
                    console.log("[FfmpegRenderer] Rendering finished successfully!");
                    resolve();
                } else {
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            // Handle spawn errors (e.g., FFmpeg not installed or not in PATH)
            ffmpegProcess.on("error", (err: Error) => {
                console.error("[FfmpegRenderer] Failed to start FFmpeg process:", err.message);
                reject(err);
            });
        });
    }
}
