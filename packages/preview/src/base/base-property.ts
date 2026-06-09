/**
 * Abstract base class for all visual properties in the preview renderer.
 * Each property knows how to apply itself to a Canvas context.
 *
 * Mirrors the BaseProperty contract from @light-render/core,
 * but instead of returning FFmpeg filter strings, it applies
 * transformations directly to the HTML5 Canvas API.
 */
export abstract class BaseProperty {
    /**
     * Applies this property's visual effect to the canvas context.
     * Called during the render pipeline before effects are applied.
     *
     * @param ctx - The canvas 2D rendering context
     * @param canvasWidth - Total canvas width in pixels
     * @param canvasHeight - Total canvas height in pixels
     * @param imgWidth - Original image width in pixels
     * @param imgHeight - Original image height in pixels
     */
    abstract applyToContext(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        imgWidth: number,
        imgHeight: number,
    ): void;

    /**
     * Serializes the property to a JSON-compatible object.
     */
    abstract toDict(): Record<string, unknown>;

    /**
     * Reconstructs the property from a JSON object.
     * Must be implemented by each subclass.
     */
    static fromDict(data: Record<string, unknown>): BaseProperty {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
