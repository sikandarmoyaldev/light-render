// Import shared types
import type { Config as SharedConfig } from "@light-render/shared";

/**
 * Global render configuration.
 * Wraps the shared config with engine-specific defaults.
 */
export class Config {
    public width: number;
    public height: number;
    public fps: number;
    public codec: string;
    public quality: string;

    constructor(data: SharedConfig) {
        this.width = data.width;
        this.height = data.height;
        this.fps = data.fps;
        this.codec = data.codec;
        this.quality = data.quality;
    }
}
