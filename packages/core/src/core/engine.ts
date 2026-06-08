// Import core modules and renderer
import type { Project as SharedProject } from "@light-render/shared";
import { validateProject } from "@light-render/shared";
import { FfmpegRenderer } from "../renderers/ffmpeg-renderer";
import { Config } from "./config";
import { Segment } from "./segment";

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
     * Executes the render pipeline for a project.
     *
     * @param project - The project object containing config and segments
     * @param outputPath - The output file path for the rendered video
     */
    async render(project: SharedProject, outputPath: string): Promise<void> {
        console.log(`[Engine] Validating project...`);

        // Validate the project structure using shared Zod schema
        const validatedProject = validateProject(project);

        // Use project config if provided, otherwise fallback to engine config
        const renderConfig = validatedProject.config
            ? new Config(validatedProject.config)
            : this.config;

        // Update renderer with project config if different
        if (renderConfig !== this.config) {
            this.renderer = new FfmpegRenderer(renderConfig);
        }

        // ✅ FIX: Convert raw validated segments to core Segment instances
        // This instantiates BaseEffect/BaseProperty classes via the registries
        const coreSegments = validatedProject.segments.map((seg) =>
            Segment.fromDict(seg as unknown),
        );

        console.log(`[Engine] Rendering ${coreSegments.length} segments...`);

        // Delegate heavy lifting to the FFmpeg renderer
        await this.renderer.render(coreSegments, outputPath);
    }
}
