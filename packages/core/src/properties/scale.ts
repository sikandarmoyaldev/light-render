// Import global registry and base class
import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * Scale property.
 * Matches the Remotion TransformSchema behavior exactly.
 * A single number multiplier (e.g., 1.0 = 100%, 1.5 = 150%, 4.0 = 400%).
 */
@propertyRegistry.register("scale")
export class ScaleProperty extends BaseProperty {
    public value: number;

    constructor(scale: number = 1) {
        super();
        // Clamp between 0.1 and 10.0 to match Remotion's Zod schema limits
        this.value = Math.min(10.0, Math.max(0.1, scale));
    }

    /**
     * Returns the FFmpeg scale filter string.
     * Uses trunc(.../2)*2 to ensure even dimensions (required for yuv420p encoding).
     */
    calculateValue(): string {
        const wExpr = `trunc(iw*${this.value}/2)*2`;
        const hExpr = `trunc(ih*${this.value}/2)*2`;
        return `scale=${wExpr}:${hExpr}`;
    }

    toDict(): Record<string, unknown> {
        return { type: "scale", value: this.value };
    }

    static fromDict(data: Record<string, unknown>): ScaleProperty {
        // Support both 'scale' and 'value' keys for flexibility
        const scaleValue = (data.value as number) ?? (data.value as number) ?? 1;
        return new ScaleProperty(scaleValue);
    }
}
