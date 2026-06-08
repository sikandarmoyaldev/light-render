/**
 * Abstract base class for all visual effects.
 * Enforces a strict contract for FFmpeg filter generation and JSON serialization.
 */
export abstract class BaseEffect {
    /**
     * Generates the FFmpeg filter string for this effect.
     */
    abstract buildFilterString(layerIndex: number, duration: number, fps: number): string;

    /**
     * Converts the effect parameters to a JSON-serializable object.
     */
    abstract toDict(): Record<string, unknown>;

    /**
     * Reconstructs the effect from a JSON object.
     */
    static fromDict(data: Record<string, unknown>): BaseEffect {
        // Using data in the error message satisfies the no-unused-vars rule
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
