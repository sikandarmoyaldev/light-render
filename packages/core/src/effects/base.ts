/**
 * Abstract base class for all visual effects.
 */
export abstract class BaseEffect {
    /**
     * Generates the FFmpeg filter string for this effect.
     * @param inputLabel - The FFmpeg stream label to read from (e.g., 'prop_0').
     * @param outputLabel - The FFmpeg stream label to write to (e.g., 'fx_0_1').
     */
    abstract buildFilterString(
        inputLabel: string,
        outputLabel: string,
        duration: number,
        fps: number,
    ): string;

    abstract toDict(): Record<string, unknown>;

    static fromDict(data: Record<string, unknown>): BaseEffect {
        throw new Error(
            `fromDict must be implemented by subclass. Received: ${JSON.stringify(data)}`,
        );
    }
}
