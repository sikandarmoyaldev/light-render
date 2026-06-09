import { BaseEffect, type EffectTransform } from "../base/base-effect";
import { effectRegistry } from "../utils/registry";

export interface RepeatingZoomParams {
    strength: number;
    zoomInDuration: number;
    zoomOutDuration: number;
    pauseDuration: number;
    easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

/**
 * Repeating zoom effect - cinematic zoom with easing.
 * Uses the EXACT same cosine formula as the FFmpeg renderer
 * to guarantee 100% visual parity between preview and final render.
 *
 * JSON format: {
 *   "type": "repeating-zoom",
 *   "strength": 1.15,
 *   "zoomInDuration": 3,
 *   "zoomOutDuration": 3,
 *   "pauseDuration": 3,
 *   "easing": "ease-in-out"
 * }
 */
@effectRegistry.register("repeating-zoom", { overwrite: false })
export class RepeatingZoomEffect extends BaseEffect {
    public params: RepeatingZoomParams;

    constructor(params: RepeatingZoomParams) {
        super();
        this.params = params;
    }

    calculateTransform(timeInSegment: number, _segmentDuration: number): EffectTransform {
        const { strength, zoomInDuration, zoomOutDuration, pauseDuration } = this.params;
        const cycleDuration = zoomInDuration + zoomOutDuration + pauseDuration;

        // Loop time within the cycle (matches FFmpeg's mod(on, cycleFrames))
        const t = timeInSegment % cycleDuration;

        // Initialize to 0 (pause phase)
        let progress = 0;

        if (t <= zoomInDuration) {
            // Phase 1: Zoom in (0 → 1)
            progress = t / zoomInDuration;
        } else if (t <= zoomInDuration + zoomOutDuration) {
            // Phase 2: Zoom out (1 → 0)
            progress = 1 - (t - zoomInDuration) / zoomOutDuration;
        }
        // Phase 3: Pause - progress stays at 0 (no assignment needed)

        // Cosine easing for buttery smoothness
        // EXACT MATCH: 1 + (strength - 1) * (1 - cos(progress * PI)) / 2
        const eased = (1 - Math.cos(progress * Math.PI)) / 2;
        const scale = 1 + (strength - 1) * eased;

        return {
            scale,
            offsetX: 0,
            offsetY: 0,
        };
    }

    toDict(): Record<string, unknown> {
        return { type: "repeating-zoom", ...this.params };
    }

    static fromDict(data: Record<string, unknown>): RepeatingZoomEffect {
        return new RepeatingZoomEffect({
            strength: (data.strength as number) ?? 1.15,
            zoomInDuration: (data.zoomInDuration as number) ?? 3,
            zoomOutDuration: (data.zoomOutDuration as number) ?? 3,
            pauseDuration: (data.pauseDuration as number) ?? 0,
            easing: (data.easing as RepeatingZoomParams["easing"]) ?? "ease-in-out",
        });
    }
}
