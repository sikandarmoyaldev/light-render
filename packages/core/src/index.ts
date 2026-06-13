// ============================================
// @light-render/core (default entry)
// Browser-safe by default - works in browser AND Node.js
// ============================================

// --- Types ---
export type { CompositionConfig, PreviewProject, RawLayer, RawSegment } from "./types";

// --- Base Classes ---
export { BaseEffect, type CanvasTransform } from "./effects/base";
export { BaseElement } from "./elements/base";
export { BaseProperty } from "./properties/base";

// --- Registry ---
export {
    effectRegistry,
    elementRegistry,
    propertyRegistry,
    type PluginClass,
    type RegisterOptions,
} from "./utils/registry";

// --- Canvas Renderer (Browser-Safe) ---
export { renderFrame } from "./renderers/canvas-renderer";

// --- Unified Properties & Effects ---
export { RepeatingZoomEffect, type RepeatingZoomParams } from "./effects/repeating-zoom";
export { ImageElement } from "./elements/image";
export { BlurProperty } from "./properties/blur";
export { PositionProperty } from "./properties/position";
export { ScaleProperty } from "./properties/scale";

// --- Factory API ---
export { getEffect, getProperty, LightRender, listEffects, listProperties } from "./light-render";
export type { LightRenderOptions, PluginRegistration } from "./light-render";

// --- Renderer Interface ---
export type { Renderer, RenderResult } from "./types/render";

// --- Engine (now browser-safe via lazy loading) ---
export { Engine } from "./core/engine";
