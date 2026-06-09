import { BaseProperty } from "../base/base-property";
import { propertyRegistry } from "../utils/registry";

/**
 * Scale property - uniform scaling of the layer.
 * Maps to Canvas `ctx.scale(x, y)` API.
 *
 * JSON format: { "type": "scale", "value": 1.5 }
 */
@propertyRegistry.register("scale", { overwrite: false })
export class ScaleProperty extends BaseProperty {
    public value: number;

    constructor(scale: number = 1) {
        super();
        // Clamp between 0.1 and 10.0 (matches Remotion's Zod schema)
        this.value = Math.min(10.0, Math.max(0.1, scale));
    }

    applyToContext(
        ctx: CanvasRenderingContext2D,
        _canvasWidth: number,
        _canvasHeight: number,
        _imgWidth: number,
        _imgHeight: number,
    ): void {
        ctx.scale(this.value, this.value);
    }

    toDict(): Record<string, unknown> {
        return { type: "scale", value: this.value };
    }

    static fromDict(data: Record<string, unknown>): ScaleProperty {
        const scaleValue = (data.value as number) ?? (data.scale as number) ?? 1;
        return new ScaleProperty(scaleValue);
    }
}
