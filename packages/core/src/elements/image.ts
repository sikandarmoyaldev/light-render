import { loadImage } from "../utils/image-cache";
import { elementRegistry } from "../utils/registry";
import { BaseElement } from "./base";

@elementRegistry.register("image")
export class ImageElement extends BaseElement {
    type = "image";
    src: string;

    constructor(src: string) {
        super();
        this.src = src;
    }

    getFfmpegInputConfig(fps: number, inputIndex: number) {
        return {
            inputArgs: ["-loop", "1", "-framerate", fps.toString(), "-i", this.src],
            initialFilters: [],
            outputStreamLabel: `${inputIndex}:v`,
        };
    }

    async drawOnCanvas(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
        const img = await loadImage(this.src);

        // Calculate "cover" dimensions
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        let drawWidth: number, drawHeight: number;

        if (imgAspectRatio > canvasAspectRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgAspectRatio;
        } else {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgAspectRatio;
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    }

    toDict() {
        return { type: "image", src: this.src };
    }

    static fromDict(data: Record<string, unknown>) {
        return new ImageElement(data.src as string);
    }
}
