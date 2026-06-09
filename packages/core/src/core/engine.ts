// Import core modules (browser-safe)
import type { Project as SharedProject } from "@light-render/shared";
import { validateProject } from "@light-render/shared";
import type { Renderer } from "../types/render";
import { Config } from "./config";
import { Segment } from "./segment";

/**
 * Main rendering engine orchestrator.
 *
 * Backend-agnostic: Detects environment and uses appropriate renderer:
 * - Node.js: FfmpegRenderer (native FFmpeg)
 * - Browser: Shows helpful error (WASM FFmpeg not yet implemented)
 *
 * @example
 * // Node.js usage (just works)
 * import { Engine, Config } from "@light-render/core";
 * const engine = new Engine(new Config({...}));
 * await engine.render(project, "output.mp4");
 *
 * // Browser usage (shows helpful error)
 * import { Engine, Config } from "@light-render/core";
 * const engine = new Engine(new Config({...}));
 * await engine.render(project, "blob:url"); // Throws: "Browser rendering not yet implemented"
 */
export class Engine {
    private config: Config;
    private renderer: Renderer | null = null;

    constructor(config: Config) {
        this.config = config;
        // Lazy initialization - renderer is created on first render() call
    }

    /**
     * Get or create the appropriate renderer for current environment.
     * Lazy-loaded to avoid bundling Node.js code in browser builds.
     */
    private async getRenderer(): Promise<Renderer> {
        if (this.renderer) return this.renderer;

        // Browser environment
        if (typeof window !== "undefined") {
            // Future: Return WasmFfmpegRenderer when implemented
            throw new Error(
                "Browser rendering not yet implemented. " +
                    "LightRender currently supports FFmpeg rendering on Node.js only. " +
                    "For browser preview, use renderFrame() from @light-render/core. " +
                    "WASM FFmpeg support is planned for a future release.",
            );
        }

        // Node.js environment - lazy import to avoid bundling in browser
        const { FfmpegRenderer } = await import("../renderers/ffmpeg-renderer");
        this.renderer = new FfmpegRenderer(this.config);
        return this.renderer;
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

        // Update config if different
        if (renderConfig !== this.config) {
            this.config = renderConfig;
            // Reset renderer so it gets recreated with new config on next render()
            this.renderer = null;
        }

        // Convert raw validated segments to core Segment instances
        const coreSegments = validatedProject.segments.map((seg) =>
            Segment.fromDict(seg as unknown),
        );

        console.log(`[Engine] Rendering ${coreSegments.length} segments...`);

        // Get appropriate renderer for environment and delegate
        const renderer = await this.getRenderer();
        await renderer.render(coreSegments, outputPath);
    }
}
