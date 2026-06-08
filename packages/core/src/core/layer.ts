// Import shared types and the single validation utility needed
import type { LayerType, Layer as SharedLayer } from "@light-render/shared";
import { validateLayer } from "@light-render/shared";

// Import core registries and base classes
import { BaseEffect } from "../effects/base";
import { BaseProperty } from "../properties/base";
import { effectRegistry, propertyRegistry } from "../utils/registry";

/**
 * A layer in a segment (image, video, text, etc.).
 */
export class Layer {
    public id: string;
    public src: string;
    public type: LayerType;
    public properties: Record<string, BaseProperty>;
    public effects: BaseEffect[];

    constructor(data: SharedLayer) {
        this.id = data.id;
        this.src = data.src;
        this.type = data.type;
        this.properties = {};
        this.effects = [];
    }

    /**
     * Create layer from raw dictionary, validating via shared utils and instantiating plugins.
     */
    static fromDict(data: unknown): Layer {
        // 1. Validate and clean the raw layer data.
        // Zod automatically and recursively validates all nested properties and effects here.
        const validatedData = validateLayer(data);

        // 2. Instantiate the Layer class with the strictly typed, clean data
        const layer = new Layer(validatedData);

        // 3. Parse and instantiate properties safely via the registry
        for (const [propName, propData] of Object.entries(validatedData.properties)) {
            const propDataRecord = propData as Record<string, unknown>;
            const propType = (propDataRecord.type as string) || propName;

            const PropClass = propertyRegistry.get(propType);
            layer.properties[propName] = PropClass.fromDict(propDataRecord);
        }

        // 4. Parse and instantiate effects safely via the registry
        for (const effectData of validatedData.effects) {
            const EffectClass = effectRegistry.get(effectData.type);

            // effectData is already strictly typed as `Effect` (which extends Record<string, unknown>)
            layer.effects.push(EffectClass.fromDict(effectData));
        }

        return layer;
    }
}
