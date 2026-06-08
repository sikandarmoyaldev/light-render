// Import base classes to strictly type the global registries
import { BaseEffect } from "../effects/base";
import { BaseProperty } from "../properties/base";

/**
 * Strict interface for plugin classes.
 * We only require the static factory method.
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
     * @default false
     */
    overwrite?: boolean;
}

/**
 * Generic registry for plugins (effects, properties, etc.).
 * Mirrors the Python Registry decorator pattern with strict type safety.
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
     * Returns void to tell TypeScript not to replace the original class type.
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
     */
    list(): string[] {
        return Array.from(this._registry.keys());
    }

    /**
     * Check if a plugin is registered.
     */
    has(name: string): boolean {
        return this._registry.has(name);
    }
}

// Global singleton registries strictly typed to their base classes
export const effectRegistry = new Registry<BaseEffect>("Effect");
export const propertyRegistry = new Registry<BaseProperty>("Property");
