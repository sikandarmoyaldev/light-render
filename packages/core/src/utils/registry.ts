// Import base classes to strictly type the global registries
// These base classes now enforce the dual-mode contract (FFmpeg + Canvas)
import { BaseEffect } from "../effects/base";
import { BaseElement } from "../elements/base";
import { BaseProperty } from "../properties/base";

/**
 * Strict interface for plugin classes.
 *
 * In the Unified Architecture, every plugin must implement:
 * 1. A static `fromDict` factory for JSON deserialization.
 * 2. `buildFfmpegFilterString` (via BaseProperty/BaseEffect) for server-side rendering.
 * 3. `applyToCanvasContext` or `calculateCanvasTransform` for browser live preview.
 *
 * The registry ensures type safety for the factory method, while the
 * base class inheritance ensures the dual-mode rendering methods exist.
 */
export type PluginClass<T> = {
    fromDict(data: Record<string, unknown>): T;
};

/**
 * Options for registering a plugin.
 */
export interface RegisterOptions {
    /**
     * If true, allows overwriting an existing plugin with the same name.
     * Use with caution to avoid breaking existing projects.
     * @default false
     */
    overwrite?: boolean;
}

/**
 * Generic registry for plugins (effects, properties, etc.).
 *
 * This registry is the central hub for the LightRender plugin system.
 * It supports both decorator-based registration (for built-ins) and
 * manual registration (for user plugins), ensuring a consistent
 * single-source-of-truth for all visual logic.
 */
export class Registry<T> {
    private name: string;
    private _registry: Map<string, PluginClass<T>>;

    constructor(name: string) {
        this.name = name;
        this._registry = new Map();
    }

    /**
     * Decorator to register a plugin class.
     *
     * @example
     * ```ts
     * @propertyRegistry.register("blur")
     * export class BlurProperty extends BaseProperty { ... }
     * ```
     *
     * @param name - The unique identifier for the plugin (e.g., "blur", "zoom")
     * @param options - Registration options (e.g., overwrite protection)
     * @returns A void decorator function
     */
    register(name: string, options: RegisterOptions = {}) {
        return (cls: PluginClass<T>): void => {
            if (this._registry.has(name) && !options.overwrite) {
                throw new Error(
                    `${this.name} '${name}' already registered. Use { overwrite: true } to replace it.`,
                );
            }
            this._registry.set(name, cls);
        };
    }

    /**
     * Manually register a plugin class (non-decorator usage).
     *
     * Useful for runtime registration or when decorators aren't supported.
     *
     * @example
     * ```ts
     * propertyRegistry.registerClass("my-blur", MyBlurProperty);
     * ```
     */
    registerClass(name: string, cls: PluginClass<T>, options: RegisterOptions = {}): void {
        if (this._registry.has(name) && !options.overwrite) {
            throw new Error(
                `${this.name} '${name}' already registered. Use { overwrite: true } to replace it.`,
            );
        }
        this._registry.set(name, cls);
    }

    /**
     * Get a registered plugin class by name.
     *
     * @throws Error if the plugin is not found
     */
    get(name: string): PluginClass<T> {
        const cls = this._registry.get(name);
        if (!cls) {
            throw new Error(
                `${this.name} '${name}' not found. Available: ${Array.from(this._registry.keys())}`,
            );
        }
        return cls;
    }

    /**
     * List all registered plugin names.
     * Useful for debugging or building UI plugin pickers.
     */
    list(): string[] {
        return Array.from(this._registry.keys());
    }

    /**
     * Check if a plugin is registered without throwing an error.
     */
    has(name: string): boolean {
        return this._registry.has(name);
    }
}

// Global singleton registries strictly typed to their base classes.
// These instances are used throughout the codebase to register and retrieve plugins.
export const effectRegistry = new Registry<BaseEffect>("Effect");
export const elementRegistry = new Registry<BaseElement>("Element");
export const propertyRegistry = new Registry<BaseProperty>("Property");
