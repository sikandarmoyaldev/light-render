import { BaseProperty } from "../base/base-property";
import { propertyRegistry } from "../utils/registry";

/**
 * Position property - center-based positioning.
 * (0, 0) = exact center, offsets are percentages of canvas size.
 * Maps to Canvas `ctx.translate(x, y)` API.
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

    applyToContext(
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

    toDict(): Record<string, unknown> {
        return { type: "position", x: this.x, y: this.y };
    }

    static fromDict(data: Record<string, unknown>): PositionProperty {
        return new PositionProperty((data.x as number) ?? 0, (data.y as number) ?? 0);
    }
}
