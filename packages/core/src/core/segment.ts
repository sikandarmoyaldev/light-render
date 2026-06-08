// Import core modules
import type { Segment as SharedSegment } from "@light-render/shared";
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
        this.layers = data.layers.map((layerData) => Layer.fromDict(layerData));
    }

    /**
     * Create segment from dictionary.
     */
    static fromDict(data: Record<string, any>): Segment {
        return new Segment({
            id: data.id,
            audio: data.audio,
            layers: data.layers,
            duration: data.duration,
        });
    }
}
