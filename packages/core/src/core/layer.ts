// Import shared types and the single validation utility needed
import { validateLayer } from "@light-render/shared";

// Import core registries and base classes
import { BaseEffect } from "../effects/base";
import { BaseElement } from "../elements/base";
import { BaseProperty } from "../properties/base";
import { effectRegistry, elementRegistry, propertyRegistry } from "../utils/registry";

/**
 * A layer in a segment (image, video, text, etc.).
 */
export class Layer {
    public id: string;
    public element: BaseElement;
    public effects: BaseEffect[];
    public properties: Record<string, BaseProperty>;

    constructor(data: { id: string; element: BaseElement }) {
        this.id = data.id;
        this.element = data.element;
        this.properties = {};
        this.effects = [];
    }
    /**
     * Create layer from raw dictionary, validating via shared utils and instantiating plugins.
     */
    static fromDict(data: unknown): Layer {
        const validatedData = validateLayer(data);

        // 1. Instantiate element via registry
        const elementType = validatedData.type as string;
        const ElementClass = elementRegistry.get(elementType);
        const element = ElementClass.fromDict(validatedData);

        const layer = new Layer({ id: validatedData.id, element });

        // 2. Parse properties
        if (validatedData.properties) {
            for (const [propName, propData] of Object.entries(validatedData.properties)) {
                const propDataRecord = propData as Record<string, unknown>;
                const propType = (propDataRecord.type as string) || propName;
                if (propertyRegistry.has(propType)) {
                    const PropClass = propertyRegistry.get(propType);
                    layer.properties[propName] = PropClass.fromDict(propDataRecord);
                }
            }
        }

        // 3. Parse effects
        if (validatedData.effects) {
            for (const effectData of validatedData.effects) {
                const effectDataRecord = effectData as Record<string, unknown>;
                const effectType = effectDataRecord.type as string;
                if (effectRegistry.has(effectType)) {
                    const EffectClass = effectRegistry.get(effectType);
                    layer.effects.push(EffectClass.fromDict(effectDataRecord));
                }
            }
        }

        return layer;
    }
}
