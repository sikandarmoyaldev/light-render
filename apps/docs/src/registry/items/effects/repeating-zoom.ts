import { BaseEffect, effectRegistry, type CanvasTransform } from "@light-render/core";

export interface RepeatingZoomParams {
    strength: number;
    zoomInDuration: number;
    zoomOutDuration: number;
    pauseDuration: number;
    easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

@effectRegistry.register("repeating-zoom", { overwrite: false })
export class RepeatingZoomEffect extends BaseEffect {
    public params: RepeatingZoomParams;

    constructor(params: RepeatingZoomParams) {
        super();
        this.params = params;
    }

    buildFfmpegFilterString(
        inputLabel: string,
        outputLabel: string,
        duration: number,
        fps: number,
    ): string {
        const { strength, zoomInDuration, zoomOutDuration, pauseDuration } = this.params;
        const totalFrames = Math.floor(duration * fps);
        const cycleDuration = zoomInDuration + zoomOutDuration + pauseDuration;
        const cycleFrames = Math.floor(cycleDuration * fps);

        const xExpr = `(iw - iw/zoom)/2 + 0.5 - (0.5 * mod(on, 2))`;
        const yExpr = `(ih - ih/zoom)/2 + 0.5 - (0.5 * mod(on, 2))`;
        const zoomExpr = `1.0000001 + (${strength} - 1.0000001) * (1 - cos(2*PI*on/${cycleFrames} + 0.00000001 * sin(2*PI*on/${cycleFrames}))) / 2`;

        return (
            `[${inputLabel}]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black@0,format=yuva420p,split[v_col][v_alp];` +
            `[v_alp]alphaextract,scale=5760:3240,zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':s=1920x1080:d=${totalFrames}:fps=${fps}[a_zoom];` +
            `[v_col]scale=5760:3240,zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':s=1920x1080:d=${totalFrames}:fps=${fps}[c_zoom];` +
            `[c_zoom][a_zoom]alphamerge[${outputLabel}]`
        );
    }

    calculateCanvasTransform(timeInSegment: number, _segmentDuration: number): CanvasTransform {
        const { strength, zoomInDuration, zoomOutDuration, pauseDuration } = this.params;
        const cycleDuration = zoomInDuration + zoomOutDuration + pauseDuration;
        const t = timeInSegment % cycleDuration;
        let progress = 0;

        if (t <= zoomInDuration) progress = t / zoomInDuration;
        else if (t <= zoomInDuration + zoomOutDuration)
            progress = 1 - (t - zoomInDuration) / zoomOutDuration;

        const eased = (1 - Math.cos(progress * Math.PI)) / 2;
        const scale = 1 + (strength - 1) * eased;

        return { scale, offsetX: 0, offsetY: 0 };
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
