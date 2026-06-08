// Import global registry and base class
import { effectRegistry } from "../utils/registry";
import { BaseEffect } from "./base";

export interface RepeatingZoomParams {
    strength: number;
    zoomInDuration: number;
    zoomOutDuration: number;
    pauseDuration: number;
    easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

@effectRegistry.register("repeating-zoom")
export class RepeatingZoomEffect extends BaseEffect {
    public params: RepeatingZoomParams;

    constructor(params: RepeatingZoomParams) {
        super();
        this.params = params;
    }

    buildFilterString(
        inputLabel: string,
        outputLabel: string,
        duration: number,
        fps: number,
    ): string {
        const { strength, zoomInDuration, zoomOutDuration, pauseDuration } = this.params;

        const totalFrames = Math.floor(duration * fps);

        // Calculate the total duration of a single animation cycle loop
        const cycleDuration = zoomInDuration + zoomOutDuration + pauseDuration;
        const cycleFrames = Math.floor(cycleDuration * fps);

        // ✅ FIX: Wrapped in round() to completely eliminate sub-pixel shaking/shuddering
        const xExpr = "round((iw-iw/zoom)/2)";
        const yExpr = "round((ih-ih/zoom)/2)";

        /**
         * ✅ JITTER-FREE MATHEMATICAL EQUATION
         * Anchored at 1.001 to prevent engine snapping anomalies.
         */
        const zoomExpr = `1.001+(${strength}-1.001)*(1-cos(2*PI*mod(on-1,${cycleFrames})/${cycleFrames}))/2`;

        /**
         * ✅ THE FIX-ALL TRANSPARENCY PIPELINE
         * Note the addition of 'format=yuva420p' directly after padding.
         * This forces JPEG assets to accept an alpha channel prior to splitting.
         */
        return (
            `[${inputLabel}]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black@0,format=yuva420p,split[v_col][v_alp];` +
            `[v_alp]alphaextract,scale=5760:3240,zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':s=1920x1080:d=${totalFrames}:fps=${fps}[a_zoom];` +
            `[v_col]scale=5760:3240,zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':s=1920x1080:d=${totalFrames}:fps=${fps}[c_zoom];` +
            `[c_zoom][a_zoom]alphamerge[${outputLabel}]`
        );
    }

    toDict(): Record<string, unknown> {
        return { type: "repeating-zoom", ...this.params };
    }

    static fromDict(data: Record<string, unknown>): RepeatingZoomEffect {
        return new RepeatingZoomEffect({
            // ✅ Slightly boosted base strength default value for a more premium pop
            strength: (data.strength as number) ?? 1.28,
            zoomInDuration: (data.zoomInDuration as number) ?? 3,
            zoomOutDuration: (data.zoomOutDuration as number) ?? 3,
            pauseDuration: (data.pauseDuration as number) ?? 0,
            easing: (data.easing as RepeatingZoomParams["easing"]) ?? "ease-in-out",
        });
    }
}
