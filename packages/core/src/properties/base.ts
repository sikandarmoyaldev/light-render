/**
 * Abstract base class for all layer properties (position, scale, etc.).
 * Enforces a strict contract for FFmpeg parameter calculation and JSON serialization.
 */
export abstract class BaseProperty {
    /**
     * Calculates the FFmpeg parameter value for this property.
     */
    abstract calculateValue(
        canvasWidth: number,
        canvasHeight: number,
        mediaWidth: number,
        mediaHeight: number,
    ): number | string;

    /**
     * Converts the property parameters to a JSON-serializable object.
     */
    abstract toDict(): Record<string, unknown>;

    /**
     * Reconstructs the property from a JSON object.
     */
    static fromDict(data: Record<string, unknown>): BaseProperty {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
