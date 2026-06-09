import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * Position property - center-based positioning.
 *
 * Unified Architecture: Works in BOTH FFmpeg and Canvas with 100% visual parity.
 *
 * - FFmpeg: Generates overlay expression for video compositing
 * - Canvas: Applies translate transform for browser preview
 *
 * (0, 0) = exact center of canvas
 * Values represent percentage offsets from center (e.g., x=50 moves 50% right)
 *
 * JSON format: { "type": "position", "x": 10, "y": -20 }
 */
@propertyRegistry.register("position", { overwrite: false })
export class PositionProperty extends BaseProperty {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    /**
     * FFmpeg: Builds the overlay position expression.
     *
     * Uses FFmpeg's W/H (canvas) and w/h (media) variables to calculate position.
     * (W-w)/2 is the exact center, then we add percentage offsets.
     *
     * @example
     * // For x=10, y=-20 on 1920x1080 canvas:
     * // Returns: "x=((W-w)/2)+(10*W/100):y=((H-h)/2)+(-20*H/100)"
     *
     * @returns FFmpeg overlay expression string
     */
    buildFfmpegFilterString(): string {
        // (W-w)/2 is the exact center. We add the percentage offset.
        const xExpr = `((W-w)/2) + (${this.x} * W / 100)`;
        const yExpr = `((H-h)/2) + (${this.y} * H / 100)`;

        return `x=${xExpr}:y=${yExpr}`;
    }

    /**
     * Canvas: Applies position offset to the canvas rendering context.
     *
     * Translates the context by percentage of canvas dimensions.
     * (0, 0) = center, positive x = right, positive y = down.
     *
     * @example
     * // For x=10, y=-20 on 1920x1080 canvas:
     * // Calls: ctx.translate(192, -216)
     *
     * @param ctx - The 2D canvas context to modify
     * @param canvasWidth - Total canvas width in pixels
     * @param canvasHeight - Total canvas height in pixels
     * @param _imgWidth - Original image width (unused for position)
     * @param _imgHeight - Original image height (unused for position)
     */
    applyToCanvasContext(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        _imgWidth: number,
        _imgHeight: number,
    ): void {
        // Translate by percentage offset from center
        const offsetX = (this.x / 100) * canvasWidth;
        const offsetY = (this.y / 100) * canvasHeight;
        ctx.translate(offsetX, offsetY);
    }

    /**
     * Serializes the property to a JSON-compatible object.
     */
    toDict(): Record<string, unknown> {
        return { type: "position", x: this.x, y: this.y };
    }

    /**
     * Reconstructs the property from a JSON object.
     */
    static fromDict(data: Record<string, unknown>): PositionProperty {
        return new PositionProperty((data.x as number) ?? 0, (data.y as number) ?? 0);
    }
}
