// Core engine and data structures
export { Config } from "./core/config";
export { Engine } from "./core/engine";
export { Layer } from "./core/layer";
export { Segment } from "./core/segment";

// Utilities
export { loadFromJson } from "./utils/json-loader";
export {
    effectRegistry,
    propertyRegistry,
    type PluginClass,
    type RegisterOptions,
} from "./utils/registry";

// Renderers
export { FfmpegRenderer } from "./renderers/ffmpeg-renderer";

// Built-in effects (with decorators - auto-registered)
export { RepeatingZoomEffect } from "./effects/repeating-zoom";

// Built-in properties (with decorators - auto-registered)
export { BlurProperty } from "./properties/blur";
export { PositionProperty } from "./properties/position";
export { ScaleProperty } from "./properties/scale";

// Main factory API
export { getEffect, getProperty, LightRender, listEffects, listProperties } from "./light-render";
export type { LightRenderOptions, PluginRegistration } from "./light-render";
