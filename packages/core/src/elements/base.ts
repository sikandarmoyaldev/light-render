export interface FfmpegInputConfig {
    inputArgs: string[]; // FFmpeg CLI arguments (e.g., ["-i", "file.mp4"])
    initialFilters: string[]; // Filters to generate stream if no input file (e.g., for text)
    outputStreamLabel: string; // The FFmpeg stream label (e.g., "0:v" or "text_0")
}

export abstract class BaseElement {
    abstract type: string;

    /**
     * FFmpeg: Generates input arguments and initial filters for this element.
     */
    abstract getFfmpegInputConfig(
        fps: number,
        inputIndex: number,
        width: number,
        height: number,
        duration: number,
    ): FfmpegInputConfig;

    /**
     * Canvas: Draws the element onto the canvas context.
     * Context is already translated to the center (0,0).
     */
    abstract drawOnCanvas(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        timeInSegment: number,
        segmentDuration: number,
    ): Promise<void>;

    abstract toDict(): Record<string, unknown>;

    static fromDict(data: Record<string, unknown>): BaseElement {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
