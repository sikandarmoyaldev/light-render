import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * Blur property - applies gaussian-like blur to the layer.
 *
 * Unified Architecture: Works in BOTH FFmpeg and Canvas with 100% visual parity.
 *
 * - FFmpeg: Uses boxblur filter for high-performance video rendering
 * - Canvas: Uses ctx.filter for real-time browser preview
 *
 * JSON format: { "type": "blur", "radius": 25 }
 */
@propertyRegistry.register("blur", { overwrite: false })
export class BlurProperty extends BaseProperty {
    public radius: number;

    constructor(radius: number = 0) {
        super();
        this.radius = radius;
    }

    /**
     * FFmpeg: Builds the boxblur filter string.
     *
     * Uses FFmpeg's boxblur filter for high-performance gaussian-like blurring.
     * luma_power=1 is standard for performance, luma_radius controls blur amount.
     *
     * @example
     * // For radius=25:
     * // Returns: "boxblur=luma_radius=25:luma_power=1"
     *
     * @returns FFmpeg filter expression string
     */
    buildFfmpegFilterString(): string {
        if (this.radius <= 0) return "";
        return `boxblur=luma_radius=${this.radius}:luma_power=1`;
    }

    /**
     * Canvas: Applies blur to the canvas rendering context.
     *
     * Uses the Canvas 2D API filter property for real-time preview.
     * Visually matches FFmpeg's boxblur output.
     *
     * @example
     * // For radius=25:
     * // Sets: ctx.filter = "blur(25px)"
     *
     * @param ctx - The 2D canvas context to modify
     * @param _canvasWidth - Total canvas width (unused for blur)
     * @param _canvasHeight - Total canvas height (unused for blur)
     * @param _imgWidth - Original image width (unused for blur)
     * @param _imgHeight - Original image height (unused for blur)
     */
    applyToCanvasContext(
        ctx: CanvasRenderingContext2D,
        _canvasWidth: number,
        _canvasHeight: number,
        _imgWidth: number,
        _imgHeight: number,
    ): void {
        if (this.radius > 0) {
            ctx.filter = `blur(${this.radius}px)`;
        }
    }

    /**
     * Serializes the property to a JSON-compatible object.
     */
    toDict(): Record<string, unknown> {
        return { type: "blur", radius: this.radius };
    }

    /**
     * Reconstructs the property from a JSON object.
     * Supports both 'radius' and 'blur' keys for flexibility.
     */
    static fromDict(data: Record<string, unknown>): BlurProperty {
        const radius = (data.radius as number) ?? (data.blur as number) ?? 0;
        return new BlurProperty(radius);
    }
}
