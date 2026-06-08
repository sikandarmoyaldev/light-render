// Import global registry and base class
import { propertyRegistry } from "../utils/registry";
import { BaseProperty } from "./base";

/**
 * Blur property (pixel radius).
 * Maps to FFmpeg's boxblur filter for high-performance gaussian-like blurring.
 */
@propertyRegistry.register("blur")
export class BlurProperty extends BaseProperty {
    public radius: number;

    constructor(radius: number = 0) {
        super();
        this.radius = radius;
    }

    /**
     * Returns the FFmpeg boxblur filter string.
     */
    calculateValue(): string {
        if (this.radius <= 0) return "";
        // luma_power=1 is standard for performance, luma_radius is the pixel blur amount
        return `boxblur=luma_radius=${this.radius}:luma_power=1`;
    }

    toDict(): Record<string, unknown> {
        return { type: "blur", radius: this.radius };
    }

    static fromDict(data: Record<string, unknown>): BlurProperty {
        // Support both 'radius' and 'blur' (to match your Remotion JSON structure)
        const radius = (data.radius as number) ?? (data.blur as number) ?? 0;
        return new BlurProperty(radius);
    }
}
