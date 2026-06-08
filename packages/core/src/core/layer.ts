// Import shared types and registries
import type { Layer as SharedLayer } from "@light-render/shared";
import { BaseEffect } from "../effects/base";
import { BaseProperty } from "../properties/base";
import { effectRegistry, propertyRegistry } from "../utils/registry";

// Extract the strict union type directly from the Zod schema
export type LayerType = SharedLayer["type"];

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
     * Create layer from dictionary, instantiating plugins via registries.
     */
    static fromDict(data: Record<string, unknown>): Layer {
        const validTypes: LayerType[] = ["image", "video", "text", "color"];
        const rawType = data.type as string;
        const layerType: LayerType = validTypes.includes(rawType as LayerType)
            ? (rawType as LayerType)
            : "image";

        const layer = new Layer({
            id: data.id as string,
            src: data.src as string,
            type: layerType,
            properties: {},
            effects: [],
        });

        // Parse and instantiate properties safely
        if (data.properties) {
            const props = data.properties as Record<string, Record<string, unknown>>;
            for (const [propName, propData] of Object.entries(props)) {
                const propType = (propData.type as string) || propName;
                const PropClass = propertyRegistry.get(propType);
                layer.properties[propName] = PropClass.fromDict(propData);
            }
        }

        // Parse and instantiate effects safely
        if (data.effects) {
            const effects = data.effects as Array<Record<string, unknown>>;
            for (const effectData of effects) {
                const EffectClass = effectRegistry.get(effectData.type as string);
                layer.effects.push(EffectClass.fromDict(effectData));
            }
        }

        return layer;
    }
}
