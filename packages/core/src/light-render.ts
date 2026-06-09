"use client";

import type { Project as SharedProject } from "@light-render/shared";
import { Config } from "./core/config";
import type { BaseEffect } from "./effects/base";
import type { BaseProperty } from "./properties/base";
import { effectRegistry, propertyRegistry, type PluginClass } from "./utils/registry";

export interface PluginRegistration {
    name: string;
    plugin: PluginClass<BaseEffect> | PluginClass<BaseProperty>;
    overwrite?: boolean;
}

export interface LightRenderOptions {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    quality?: string;
    effects?: PluginRegistration[];
    properties?: PluginRegistration[];
    clearAll?: boolean;
}

// Define the shape of the returning auto-assigned interface
export interface LightRenderInstance extends Config {
    render: (project: SharedProject, outputPath: string) => Promise<void>;
}

/**
 * Creates a configured LightRender instance with an auto-assigned execution engine.
 */
export function LightRender(options: LightRenderOptions = {}): LightRenderInstance {
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

    for (const { name, plugin, overwrite = false } of effects) {
        effectRegistry.registerClass(name, plugin as PluginClass<BaseEffect>, { overwrite });
    }

    for (const { name, plugin, overwrite = false } of properties) {
        propertyRegistry.registerClass(name, plugin as PluginClass<BaseProperty>, { overwrite });
    }

    // Initialize core configuration base
    const config = new Config({ width, height, fps, codec, quality });

    // Auto-assign runtime engine behavior to avoid manual initialization downstream
    const renderMethod = async (project: SharedProject, outputPath: string): Promise<void> => {
        if (typeof window !== "undefined") {
            throw new Error(
                "Browser rendering via LightRender instance is not yet implemented. " +
                    "For browser video previews, utilize 'renderFrame()' directly. " +
                    "WebAssembly (WASM) compiler pipelines are slated for a future release.",
            );
        }

        // Lazy load the Engine core dynamically to prevent breaking browser bundler environments
        const { Engine } = await import("./core/engine");
        const runtimeEngine = new Engine(config);
        return await runtimeEngine.render(project, outputPath);
    };

    // Combine config properties and the auto-assigned engine runner method
    return Object.assign(config, { render: renderMethod }) as LightRenderInstance;
}

export function listEffects(): string[] {
    return effectRegistry.list();
}
export function listProperties(): string[] {
    return propertyRegistry.list();
}
export function getEffect(name: string): PluginClass<BaseEffect> {
    return effectRegistry.get(name);
}
export function getProperty(name: string): PluginClass<BaseProperty> {
    return propertyRegistry.get(name);
}
