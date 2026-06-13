export interface FfmpegInputConfig {
    inputArgs: string[];
    initialFilters: string[];
    outputStreamLabel: string;
}

export abstract class BaseElement {
    abstract type: string;

    /**
     * FFmpeg: Generates input arguments and initial filters for this element.
     * Async to support dynamic imports for Node.js-only modules (e.g., font detection).
     */
    abstract getFfmpegInputConfig(
        fps: number,
        inputIndex: number,
        width: number,
        height: number,
        duration: number,
    ): Promise<FfmpegInputConfig>;

    /**
     * Canvas: Draws the element onto the canvas context.
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
