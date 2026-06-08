// Import shared types and validation utilities
import type { Segment as SharedSegment } from "@light-render/shared";
import { validateSegment } from "@light-render/shared";

// Import core layer class
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
        // Layer.fromDict now expects `unknown`, so we pass the raw layer data directly
        this.layers = data.layers.map((layerData) => Layer.fromDict(layerData));
    }

    /**
     * Create segment from raw dictionary, validating via shared utils.
     */
    static fromDict(data: unknown): Segment {
        // Validate and clean the raw segment data
        const validatedData = validateSegment(data);
        return new Segment(validatedData);
    }
}
