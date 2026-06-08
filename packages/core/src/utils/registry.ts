// Standard TS utility for constructor types
type Constructor<T> = new (...args: any[]) => T;

/**
 * Generic registry for plugins (effects, properties, etc.).
 * Mirrors the Python Registry decorator pattern.
 */
export class Registry<T> {
    private name: string;
    private _registry: Map<string, Constructor<T>>;

    constructor(name: string) {
        this.name = name;
        this._registry = new Map();
    }

    /**
     * Decorator to register a plugin class.
     */
    register(name: string) {
        return (cls: Constructor<T>) => {
            if (this._registry.has(name)) {
                throw new Error(`${this.name} '${name}' already registered`);
            }
            this._registry.set(name, cls);
            return cls;
        };
    }

    /**
     * Get a registered plugin class by name.
     */
    get(name: string): Constructor<T> {
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
     * Create an instance of a registered plugin.
     */
    create(name: string, ...args: any[]): T {
        const cls = this.get(name);
        return new cls(...args);
    }
}

// Global singleton registries
export const effectRegistry = new Registry<any>("Effect");
export const propertyRegistry = new Registry<any>("Property");
