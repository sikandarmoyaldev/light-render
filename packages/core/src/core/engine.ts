// Import core modules and renderer
import { FfmpegRenderer } from "../renderers/ffmpeg_renderer.js";
import { Config } from "./config.js";
import { Segment } from "./segment.js";

/**
 * Main rendering engine orchestrator.
 * Bridges the data structures with the rendering backend.
 */
export class Engine {
    private config: Config;
    private renderer: FfmpegRenderer;

    constructor(config: Config) {
        this.config = config;
        this.renderer = new FfmpegRenderer(this.config);
    }

    /**
     * Executes the render pipeline for an array of segments.
     */
    async render(segments: Segment[], outputPath: string): Promise<void> {
        console.log(`[Engine] Validating ${segments.length} segments...`);

        // Delegate heavy lifting to the FFmpeg renderer
        await this.renderer.render(segments, outputPath);
    }
}
