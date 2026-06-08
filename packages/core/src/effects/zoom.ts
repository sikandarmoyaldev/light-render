// Import global registry and base class
import { effectRegistry } from "../utils/registry";
import { BaseEffect } from "./base";

/**
 * Parameter interface for the Zoom effect.
 */
export interface ZoomParams {
    start: number;
    end: number;
    easing: "linear" | "easeInOut";
    center: [number, number];
}

/**
 * Built-in Zoom effect utilizing FFmpeg zoompan.
 * Applies 9K oversampling to eliminate sub-pixel jitter.
 */
@effectRegistry.register("zoom")
export class ZoomEffect extends BaseEffect {
    public params: ZoomParams;

    constructor(params: ZoomParams) {
        super();
        this.params = params;
    }

    /**
     * Generates the strict FFmpeg filter string for this effect.
     */
    buildFilterString(layerIndex: number, duration: number, fps: number): string {
        const totalFrames = Math.floor(duration * fps);
        const zoomIncrement = (this.params.end - this.params.start) / totalFrames;

        const zoomExpr = `min(zoom+${zoomIncrement},${this.params.end})`;
        const xExpr = "iw/2-(iw/zoom/2)";
        const yExpr = "ih/2-(ih/zoom/2)";

        return `[${layerIndex}:v]zoompan=z='${zoomExpr}':d=${totalFrames}:x='${xExpr}':y='${yExpr}':s='9600x5400',scale=1920:1080:flags=bicubic[zoomed_${layerIndex}]`;
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
