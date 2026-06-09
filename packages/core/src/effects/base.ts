/**
 * Transform values returned by Canvas effects.
 *
 * Represents the visual transformation to apply at a specific time.
 * Used by CanvasRenderer to animate effects in real-time.
 */
export interface CanvasTransform {
    /** Scale multiplier (1.0 = 100%, 1.15 = 115% zoom) */
    scale: number;
    /** X offset in pixels (relative to layer center) */
    offsetX: number;
    /** Y offset in pixels (relative to layer center) */
    offsetY: number;
}

/**
 * Abstract base class for ALL time-based visual effects.
 *
 * Unified Architecture: Every effect must implement BOTH:
 * - FFmpeg rendering (server-side video generation)
 * - Canvas rendering (browser live preview animation)
 *
 * This ensures 100% visual parity between preview and final render,
 * with a single source of truth for all animation logic.
 */
export abstract class BaseEffect {
    /**
     * FFmpeg: Builds the filter string for this effect.
     *
     * Used by FfmpegRenderer to generate the filtergraph command.
     * Creates complex FFmpeg filter chains for effects like zoom, fade, etc.
     *
     * @example
     * // For RepeatingZoomEffect:
     * // Returns: "[input]zoompan=z='...':x='...':y='...':s=1920x1080:d=450:fps=30[output]"
     *
     * @param inputLabel - FFmpeg stream label to read from (e.g., 'prop_0')
     * @param outputLabel - FFmpeg stream label to write to (e.g., 'fx_0_1')
     * @param duration - Segment duration in seconds
     * @param fps - Frames per second
     * @returns FFmpeg filter expression string
     */
    abstract buildFfmpegFilterString(
        inputLabel: string,
        outputLabel: string,
        duration: number,
        fps: number,
    ): string;

    /**
     * Canvas: Calculates transform values at a specific time.
     *
     * Used by CanvasRenderer for live preview animation.
     * Returns the scale/offset values to apply at the current frame.
     *
     * @example
     * // For RepeatingZoomEffect at t=2.5s:
     * // Returns: { scale: 1.15, offsetX: 0, offsetY: 0 }
     *
     * @param timeInSegment - Current time in seconds within this segment
     * @param segmentDuration - Total duration of this segment in seconds
     * @returns Transform values to apply to the canvas
     */
    abstract calculateCanvasTransform(
        timeInSegment: number,
        segmentDuration: number,
    ): CanvasTransform;

    /**
     * Serializes the effect to a JSON-compatible object.
     * Used for saving projects and transmitting over API.
     */
    abstract toDict(): Record<string, unknown>;

    /**
     * Reconstructs the effect from a JSON object.
     * Must be implemented by each subclass.
     *
     * @throws Error if not overridden by subclass
     */
    static fromDict(data: Record<string, unknown>): BaseEffect {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
