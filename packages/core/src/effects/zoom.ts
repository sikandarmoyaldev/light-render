// Import global registry and base class
import { effectRegistry } from "../utils/registry";
import { BaseEffect } from "./base";

export interface ZoomParams {
    start: number;
    end: number;
    easing: "linear" | "easeInOut";
    center: [number, number];
}

@effectRegistry.register("zoom")
export class ZoomEffect extends BaseEffect {
    public params: ZoomParams;

    constructor(params: ZoomParams) {
        super();
        this.params = params;
    }

    /**
     * Generates the FFmpeg filter string using dynamic input/output labels.
     */
    buildFilterString(
        inputLabel: string,
        outputLabel: string,
        duration: number,
        fps: number,
    ): string {
        const totalFrames = Math.floor(duration * fps);
        const zoomIncrement = (this.params.end - this.params.start) / totalFrames;

        const zoomExpr = `min(zoom+${zoomIncrement},${this.params.end})`;
        const xExpr = "iw/2-(iw/zoom/2)";
        const yExpr = "ih/2-(ih/zoom/2)";

        // Use dynamic inputLabel and outputLabel
        return `[${inputLabel}]zoompan=z='${zoomExpr}':d=${totalFrames}:x='${xExpr}':y='${yExpr}':s='9600x5400',scale=1920:1080:flags=bicubic[${outputLabel}]`;
    }

    toDict(): Record<string, unknown> {
        return { type: "zoom", ...this.params };
    }

    static fromDict(data: Record<string, unknown>): ZoomEffect {
        return new ZoomEffect({
            start: (data.start as number) ?? 1.0,
            end: (data.end as number) ?? 1.15,
            easing: (data.easing as "linear" | "easeInOut") ?? "linear",
            center: (data.center as [number, number]) ?? [0.5, 0.5],
        });
    }
}
