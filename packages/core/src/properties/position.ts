// Import global registry and base class
import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * X, Y position property (0-1 range, where 0.5, 0.5 is the center).
 */
@propertyRegistry.register("position")
export class PositionProperty extends BaseProperty {
    public x: number;
    public y: number;

    constructor(x: number = 0.5, y: number = 0.5) {
        super();
        this.x = x;
        this.y = y;
    }

    /**
     * Calculates the pixel coordinate for the overlay filter.
     */
    calculateValue(
        canvasWidth: number,
        canvasHeight: number,
        mediaWidth: number,
        mediaHeight: number,
    ): string {
        const targetX = this.x * canvasWidth;
        const targetY = this.y * canvasHeight;

        const finalX = Math.round(targetX - mediaWidth / 2);
        const finalY = Math.round(targetY - mediaHeight / 2);

        return `x=${finalX}:y=${finalY}`;
    }

    toDict(): Record<string, unknown> {
        return { type: "position", x: this.x, y: this.y };
    }

    static fromDict(data: Record<string, unknown>): PositionProperty {
        return new PositionProperty((data.x as number) ?? 0.5, (data.y as number) ?? 0.5);
    }
}
