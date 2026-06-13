import { elementRegistry } from "../utils/registry";
import { BaseElement, type FfmpegInputConfig } from "./base";

@elementRegistry.register("video")
export class VideoElement extends BaseElement {
    type = "video";
    src: string;

    constructor(src: string) {
        super();
        this.src = src;
    }

    // ✅ Now async with explicit return type
    async getFfmpegInputConfig(fps: number, inputIndex: number): Promise<FfmpegInputConfig> {
        return {
            inputArgs: ["-i", this.src],
            initialFilters: [] as string[],
            outputStreamLabel: `${inputIndex}:v`,
        };
    }

    async drawOnCanvas(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        timeInSegment: number,
    ) {
        if (typeof document !== "undefined") {
            const video = document.createElement("video");
            video.src = this.src;
            video.muted = true;
            video.playsInline = true;

            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
                video.load();
            });
            video.currentTime = timeInSegment;
            await new Promise((resolve) => {
                video.onseeked = resolve;
            });

            const vidAspectRatio = video.videoWidth / video.videoHeight;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            let drawWidth: number, drawHeight: number;

            if (vidAspectRatio > canvasAspectRatio) {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / vidAspectRatio;
            } else {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * vidAspectRatio;
            }

            ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
    }

    toDict() {
        return { type: "video", src: this.src };
    }

    static fromDict(data: Record<string, unknown>) {
        return new VideoElement(data.src as string);
    }
}
