import { elementRegistry } from "../utils/registry";
import { BaseElement } from "./base";

@elementRegistry.register("text")
export class TextElement extends BaseElement {
    type = "text";
    content: string;
    fontSize: number;
    color: string;

    constructor(content: string, fontSize: number = 48, color: string = "white") {
        super();
        this.content = content;
        this.fontSize = fontSize;
        this.color = color;
    }

    getFfmpegInputConfig(
        fps: number,
        inputIndex: number,
        width: number,
        height: number,
        duration: number,
    ) {
        // Text generates its own stream using color + drawtext
        const textFilter =
            `color=c=black@0:s=${width}x${height}:r=${fps}:d=${duration},` +
            `drawtext=text='${this.content}':fontcolor=${this.color}:fontsize=${this.fontSize}:x=(w-text_w)/2:y=(h-text_h)/2` +
            `[text_${inputIndex}]`;

        return {
            inputArgs: [], // No input file needed
            initialFilters: [textFilter],
            outputStreamLabel: `text_${inputIndex}`,
        };
    }

    async drawOnCanvas(ctx: CanvasRenderingContext2D) {
        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.content, 0, 0);
    }

    toDict() {
        return { type: "text", content: this.content, fontSize: this.fontSize, color: this.color };
    }
    static fromDict(data: Record<string, unknown>) {
        return new TextElement(
            data.content as string,
            (data.fontSize as number) ?? 48,
            (data.color as string) ?? "white",
        );
    }
}
