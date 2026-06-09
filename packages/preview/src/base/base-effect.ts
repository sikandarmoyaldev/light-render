/**
 * Abstract base class for all time-based effects in the preview renderer.
 * Each effect knows how to calculate its transform values at any given time.
 *
 * Mirrors the BaseEffect contract from @light-render/core,
 * but instead of building FFmpeg filter strings, it calculates
 * scale/position values for canvas transformations.
 */
export interface EffectTransform {
    /** Scale multiplier (1.0 = 100%, 1.15 = 115%) */
    scale: number;
    /** X offset in pixels (relative to center) */
    offsetX: number;
    /** Y offset in pixels (relative to center) */
    offsetY: number;
}

export abstract class BaseEffect {
    /**
     * Calculates the transform values at a specific time within the segment.
     * Called every frame during playback.
     *
     * @param timeInSegment - Current time in seconds within this segment
     * @param segmentDuration - Total duration of this segment in seconds
     * @returns Transform values to apply to the layer
     */
    abstract calculateTransform(timeInSegment: number, segmentDuration: number): EffectTransform;

    /**
     * Serializes the effect to a JSON-compatible object.
     */
    abstract toDict(): Record<string, unknown>;

    /**
     * Reconstructs the effect from a JSON object.
     * Must be implemented by each subclass.
     */
    static fromDict(data: Record<string, unknown>): BaseEffect {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
