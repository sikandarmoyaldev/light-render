// ============================================
// @light-render/core/types/render.ts
// Backend-agnostic renderer interface
// ============================================

import type { Segment } from "../core/segment";

/**
 * Abstract interface for all rendering backends.
 *
 * Implement this for:
 * - FfmpegRenderer (Node.js native FFmpeg)
 * - WasmFfmpegRenderer (Browser via FFmpeg.wasm)
 * - CloudflareRenderer (Edge via Workers)
 * - MockRenderer (testing)
 */
export interface Renderer {
    /**
     * Renders segments to the specified output path/URL.
     * @param segments - Array of processed segments to render
     * @param outputPath - Destination (file path for Node, blob URL for browser, etc.)
     */
    render(segments: Segment[], outputPath: string): Promise<void>;

    /**
     * Optional: Check if this renderer is available in current environment.
     * Returns a Promise because it may use dynamic imports.
     */
    isAvailable?(): Promise<boolean>;
}

/**
 * Render result returned after successful rendering.
 */
export interface RenderResult {
    /** Output path or URL where the rendered video is located */
    outputPath: string;
    /** Duration of the rendered video in seconds */
    duration: number;
    /** File size in bytes (if available) */
    size?: number;
    /** Additional metadata from the renderer */
    metadata?: Record<string, unknown>;
}
