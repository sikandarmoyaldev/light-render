/**
 * Abstract base class for ALL visual properties.
 *
 * Unified Architecture: Every property must implement BOTH:
 * - FFmpeg rendering (server-side video generation)
 * - Canvas rendering (browser live preview)
 *
 * This ensures 100% visual parity between preview and final render,
 * with a single source of truth for all visual logic.
 */
export abstract class BaseProperty {
    /**
     * FFmpeg: Builds the filter string for this property.
     *
     * Used by FfmpegRenderer to generate the filtergraph command.
     *
     * @example
     * // For BlurProperty with radius=25:
     * // Returns: "boxblur=luma_radius=25:luma_power=1"
     *
     * @returns FFmpeg filter expression string
     */
    abstract buildFfmpegFilterString(): string;

    /**
     * Canvas: Applies this property to the canvas rendering context.
     *
     * Used by CanvasRenderer for live preview in the browser.
     * Modifies the ctx state directly (e.g., ctx.filter, ctx.scale).
     *
     * @param ctx - The 2D canvas context to modify
     * @param canvasWidth - Total canvas width in pixels
     * @param canvasHeight - Total canvas height in pixels
     * @param mediaWidth - Original media width in pixels
     * @param mediaHeight - Original media height in pixels
     */
    abstract applyToCanvasContext(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        mediaWidth: number,
        mediaHeight: number,
    ): void;

    /**
     * Serializes the property to a JSON-compatible object.
     * Used for saving projects and transmitting over API.
     */
    abstract toDict(): Record<string, unknown>;

    /**
     * Reconstructs the property from a JSON object.
     * Must be implemented by each subclass.
     *
     * @throws Error if not overridden by subclass
     */
    static fromDict(data: Record<string, unknown>): BaseProperty {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
