// Import core engine, config, and registries
import { Config } from "./core/config";
import { Engine } from "./core/engine";
import type { BaseEffect } from "./effects/base";
import type { BaseProperty } from "./properties/base";
import { effectRegistry, propertyRegistry, type PluginClass } from "./utils/registry";

/**
 * Options for registering custom plugins with LightRender.
 */
export interface PluginRegistration {
    /**
     * The name to register the plugin under (e.g., "my-zoom", "custom-blur").
     */
    name: string;
    /**
     * The plugin class to register (must extend BaseEffect or BaseProperty).
     */
    plugin: PluginClass<BaseEffect> | PluginClass<BaseProperty>;
    /**
     * If true, allows overwriting a built-in plugin with the same name.
     * @default false
     */
    overwrite?: boolean;
}

/**
 * Configuration options for creating a LightRender instance.
 * All properties are optional with sensible defaults.
 */
export interface LightRenderOptions {
    /**
     * Output video width in pixels.
     * @default 1920
     */
    width?: number;
    /**
     * Output video height in pixels.
     * @default 1080
     */
    height?: number;
    /**
     * Frames per second.
     * @default 30
     */
    fps?: number;
    /**
     * Video codec (e.g., "h264", "libx265").
     * @default "h264"
     */
    codec?: string;
    /**
     * Encoding quality preset.
     * @default "high"
     */
    quality?: string;
    /**
     * Custom effects to register (in addition to built-ins).
     */
    effects?: PluginRegistration[];
    /**
     * Custom properties to register (in addition to built-ins).
     */
    properties?: PluginRegistration[];
    /**
     * If true, clears all plugins before registering (built-ins + custom).
     * Use with caution!
     * @default false
     */
    clearAll?: boolean;
}

/**
 * Creates a configured LightRender engine instance.
 *
 * Built-in plugins are auto-registered via decorators on import.
 * Custom plugins can be added via the effects/properties options.
 */
export function LightRender(options: LightRenderOptions = {}): Engine {
    // Extract options with defaults
    const {
        width = 1920,
        height = 1080,
        fps = 30,
        codec = "h264",
        quality = "high",
        effects = [],
        properties = [],
        clearAll = false,
    } = options;

    // Optional: Clear all existing plugins first
    if (clearAll) {
        effectRegistry.list().forEach((name) => {
            // @ts-expect-error: Private property access for controlled cleanup
            effectRegistry._registry.delete(name);
        });
        propertyRegistry.list().forEach((name) => {
            // @ts-expect-error: Private property access for controlled cleanup
            propertyRegistry._registry.delete(name);
        });
    }

    // Register custom effects (built-ins already registered via decorators)
    for (const { name, plugin, overwrite = false } of effects) {
        effectRegistry.registerClass(name, plugin as PluginClass<BaseEffect>, { overwrite });
    }

    // Register custom properties
    for (const { name, plugin, overwrite = false } of properties) {
        propertyRegistry.registerClass(name, plugin as PluginClass<BaseProperty>, { overwrite });
    }

    // Create Config instance
    const config = new Config({
        width,
        height,
        fps,
        codec,
        quality,
    });

    // Return new Engine instance
    return new Engine(config);
}

/**
 * Utility to list all registered effects.
 */
export function listEffects(): string[] {
    return effectRegistry.list();
}

/**
 * Utility to list all registered properties.
 */
export function listProperties(): string[] {
    return propertyRegistry.list();
}

/**
 * Utility to get a registered effect class by name.
 */
export function getEffect(name: string): PluginClass<BaseEffect> {
    return effectRegistry.get(name);
}

/**
 * Utility to get a registered property class by name.
 */
export function getProperty(name: string): PluginClass<BaseProperty> {
    return propertyRegistry.get(name);
}
