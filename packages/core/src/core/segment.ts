// Import core modules and the SharedLayer type for strict casting
import type { Layer as SharedLayer, Segment as SharedSegment } from "@light-render/shared";
import { Layer } from "./layer";

/**
 * Represents a distinct segment of the video timeline.
 */
export class Segment {
    public id: string | number;
    public duration: number;
    public audio?: string;
    public layers: Layer[];

    constructor(data: SharedSegment) {
        this.id = data.id;
        this.audio = data.audio;
        this.duration = data.duration;
        this.layers = data.layers.map((layerData) =>
            Layer.fromDict(layerData as unknown as Record<string, unknown>),
        );
    }

    /**
     * Create segment from dictionary.
     */
    static fromDict(data: Record<string, unknown>): Segment {
        return new Segment({
            id: data.id as string | number,
            audio: data.audio as string | undefined,
            // Cast to the strict SharedLayer array type expected by the Segment constructor
            layers: (data.layers as SharedLayer[]) || [],
            duration: data.duration as number,
        });
    }
}
