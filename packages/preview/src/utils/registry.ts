// Exact same registry pattern as @light-render/core
import type { BaseEffect } from "../base/base-effect";
import type { BaseProperty } from "../base/base-property";

export type PluginClass<T> = {
    fromDict(data: Record<string, unknown>): T;
};

export interface RegisterOptions {
    overwrite?: boolean;
}

export class Registry<T> {
    private name: string;
    private _registry: Map<string, PluginClass<T>>;

    constructor(name: string) {
        this.name = name;
        this._registry = new Map();
    }

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

    registerClass(name: string, cls: PluginClass<T>, options: RegisterOptions = {}): void {
        if (this._registry.has(name) && !options.overwrite) {
            throw new Error(
                `${this.name} '${name}' already registered. Use { overwrite: true } to replace it.`,
            );
        }
        this._registry.set(name, cls);
    }

    get(name: string): PluginClass<T> {
        const cls = this._registry.get(name);
        if (!cls) {
            throw new Error(
                `${this.name} '${name}' not found. Available: ${Array.from(this._registry.keys())}`,
            );
        }
        return cls;
    }

    list(): string[] {
        return Array.from(this._registry.keys());
    }

    has(name: string): boolean {
        return this._registry.has(name);
    }
}

// Global singleton registries
export const effectRegistry = new Registry<BaseEffect>("Effect");
export const propertyRegistry = new Registry<BaseProperty>("Property");
