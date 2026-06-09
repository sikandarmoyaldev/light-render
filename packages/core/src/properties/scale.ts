import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * Scale property - uniform scaling of the layer.
 *
 * Unified Architecture: Works in BOTH FFmpeg and Canvas with 100% visual parity.
 *
 * - FFmpeg: Uses scale filter with even dimensions for yuv420p encoding
 * - Canvas: Uses ctx.scale for real-time browser preview
 *
 * Matches Remotion TransformSchema behavior exactly.
 * A single number multiplier: 1.0 = 100%, 1.5 = 150%, 4.0 = 400%.
 *
 * JSON format: { "type": "scale", "value": 1.5 }
 */
@propertyRegistry.register("scale", { overwrite: false })
export class ScaleProperty extends BaseProperty {
    public value: number;

    constructor(scale: number = 1) {
        super();
        // Clamp between 0.1 and 10.0 to match Remotion's Zod schema limits
        this.value = Math.min(10.0, Math.max(0.1, scale));
    }

    /**
     * FFmpeg: Builds the scale filter string with even dimensions.
     *
     * Uses trunc(.../2)*2 to ensure even width/height (required for yuv420p encoding).
     * This prevents FFmpeg concat crashes and ensures compatibility with H.264/H.265.
     *
     * @example
     * // For value=1.5:
     * // Returns: "scale=trunc(iw*1.5/2)*2:trunc(ih*1.5/2)*2"
     *
     * @returns FFmpeg scale filter expression string
     */
    buildFfmpegFilterString(): string {
        const wExpr = `trunc(iw*${this.value}/2)*2`;
        const hExpr = `trunc(ih*${this.value}/2)*2`;
        return `scale=${wExpr}:${hExpr}`;
    }

    /**
     * Canvas: Applies uniform scale to the canvas rendering context.
     *
     * Uses the Canvas 2D API scale method for real-time preview.
     * Visually matches FFmpeg's scale filter output.
     *
     * @example
     * // For value=1.5:
     * // Calls: ctx.scale(1.5, 1.5)
     *
     * @param ctx - The 2D canvas context to modify
     * @param _canvasWidth - Total canvas width (unused for scale)
     * @param _canvasHeight - Total canvas height (unused for scale)
     * @param _imgWidth - Original image width (unused for scale)
     * @param _imgHeight - Original image height (unused for scale)
     */
    applyToCanvasContext(
        ctx: CanvasRenderingContext2D,
        _canvasWidth: number,
        _canvasHeight: number,
        _imgWidth: number,
        _imgHeight: number,
    ): void {
        ctx.scale(this.value, this.value);
    }

    /**
     * Serializes the property to a JSON-compatible object.
     */
    toDict(): Record<string, unknown> {
        return { type: "scale", value: this.value };
    }

    /**
     * Reconstructs the property from a JSON object.
     * Supports both 'value' and 'scale' keys for flexibility.
     */
    static fromDict(data: Record<string, unknown>): ScaleProperty {
        const scaleValue = (data.value as number) ?? (data.scale as number) ?? 1;
        return new ScaleProperty(scaleValue);
    }
}
