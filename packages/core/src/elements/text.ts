import { elementRegistry } from "../utils/registry";
import { BaseElement, type FfmpegInputConfig } from "./base"; // ✅ Import FfmpegInputConfig

@elementRegistry.register("text")
export class TextElement extends BaseElement {
    type = "text";
    content: string;
    fontSize: number;
    color: string;
    fontfile?: string;

    constructor(
        content: string,
        fontSize: number = 48,
        color: string = "white",
        fontfile?: string,
    ) {
        super();
        this.content = content;
        this.fontSize = fontSize;
        this.color = color;
        this.fontfile = fontfile;
    }

    /**
     * Auto-detect a default font file based on OS.
     * Uses dynamic import to avoid bundling node:fs in browser builds.
     */
    private async resolveFontFile(): Promise<string> {
        // ✅ Dynamic import only in Node.js environment
        if (typeof process !== "undefined" && process.versions?.node) {
            const { existsSync } = await import("node:fs");

            if (this.fontfile && existsSync(this.fontfile)) {
                return this.fontfile;
            }

            // Try common system fonts
            const candidates = [
                "C:/Windows/Fonts/arial.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "C:/Windows/Fonts/segoeui.ttf",
            ];

            for (const candidate of candidates) {
                if (existsSync(candidate)) {
                    return candidate;
                }
            }
        }

        throw new Error(
            "No font file found. Please specify 'fontfile' in your text element or install a system font.",
        );
    }

    // ✅ Explicitly type the return as Promise<FfmpegInputConfig>
    async getFfmpegInputConfig(
        fps: number,
        inputIndex: number,
        width: number,
        height: number,
        duration: number,
    ): Promise<FfmpegInputConfig> {
        const fontfile = await this.resolveFontFile();

        // Escape special characters for FFmpeg drawtext
        const escapedContent = this.content
            .replace(/\\/g, "\\\\")
            .replace(/:/g, "\\:")
            .replace(/'/g, "\\'");

        const escapedFontfile = fontfile.replace(/\\/g, "/").replace(/:/g, "\\:");

        const textFilter =
            `color=c=black@0:s=${width}x${height}:r=${fps}:d=${duration},` +
            `drawtext=fontfile='${escapedFontfile}':text='${escapedContent}':fontcolor=${this.color}:fontsize=${this.fontSize}:x=(w-text_w)/2:y=(h-text_h)/2` +
            `[text_${inputIndex}]`;

        // ✅ Explicitly type the array as string[]
        return {
            inputArgs: [] as string[],
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
        return {
            type: "text",
            content: this.content,
            fontSize: this.fontSize,
            color: this.color,
            fontfile: this.fontfile,
        };
    }

    static fromDict(data: Record<string, unknown>) {
        return new TextElement(
            data.content as string,
            (data.fontSize as number) ?? 48,
            (data.color as string) ?? "#ffffff",
            data.fontfile as string | undefined,
        );
    }
}
