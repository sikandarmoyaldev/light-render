// Import global registry and base class
import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * X, Y position property.
 * 0, 0 represents the exact center of the canvas.
 * Values represent percentage offsets from the center (e.g., x=50 moves it 50% to the right).
 */
@propertyRegistry.register("position")
export class PositionProperty extends BaseProperty {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    /**
     * Returns the FFmpeg overlay expression for this position.
     * W/H = Canvas size, w/h = Media size.
     */
    calculateValue(): string {
        // (W-w)/2 is the exact center. We add the percentage offset.
        const xExpr = `((W-w)/2) + (${this.x} * W / 100)`;
        const yExpr = `((H-h)/2) + (${this.y} * H / 100)`;

        return `x=${xExpr}:y=${yExpr}`;
    }

    toDict(): Record<string, unknown> {
        return { type: "position", x: this.x, y: this.y };
    }

    static fromDict(data: Record<string, unknown>): PositionProperty {
        return new PositionProperty((data.x as number) ?? 0, (data.y as number) ?? 0);
    }
}
