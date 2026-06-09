import { BaseProperty } from "../base/base-property";
import { propertyRegistry } from "../utils/registry";

/**
 * Blur property - applies gaussian blur to the layer.
 * Maps to Canvas `filter: blur(Xpx)` API.
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

    applyToContext(
        ctx: CanvasRenderingContext2D,
        _canvasWidth: number,
        _canvasHeight: number,
        _imgWidth: number,
        _imgHeight: number,
    ): void {
        if (this.radius > 0) {
            // Canvas filter API - matches FFmpeg's boxblur visually
            ctx.filter = `blur(${this.radius}px)`;
        }
    }

    toDict(): Record<string, unknown> {
        return { type: "blur", radius: this.radius };
    }

    static fromDict(data: Record<string, unknown>): BlurProperty {
        const radius = (data.radius as number) ?? (data.blur as number) ?? 0;
        return new BlurProperty(radius);
    }
}
