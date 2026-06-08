// Import shared types and registries
import type { Layer as SharedLayer } from "@light-render/shared";

/**
 * A layer in a segment (image, video, text, etc.).
 */
export class Layer {
    public id: string;
    public src: string;
    public type: string;
    public properties: Record<string, any>;
    public effects: any[];

    constructor(data: SharedLayer) {
        this.id = data.id;
        this.src = data.src;
        this.type = data.type;
        this.properties = data.properties || {};
        this.effects = data.effects || [];
    }

    /**
     * Convert layer to dictionary for JSON serialization.
     */
    toDict(): Record<string, any> {
        return {
            id: this.id,
            src: this.src,
            type: this.type,
            properties: this.properties,
            effects: this.effects,
        };
    }

    /**
     * Create layer from dictionary (JSON deserialization).
     */
    static fromDict(data: Record<string, any>): Layer {
        // In Phase 1, we keep properties/effects as raw data.
        // Phase 2 will instantiate them via registries.
        return new Layer({
            id: data.id,
            src: data.src,
            type: data.type,
            properties: data.properties || {},
            effects: data.effects || [],
        });
    }
}
