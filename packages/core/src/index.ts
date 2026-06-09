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

// Renderers (FFmpeg + Canvas)
export { renderFrame } from "./renderers/canvas-renderer";
export { FfmpegRenderer } from "./renderers/ffmpeg-renderer";

// Browser types for preview/player
export type { CompositionConfig, PreviewProject, RawLayer, RawSegment } from "./types";

// Built-in effects (with decorators - auto-registered)
export { RepeatingZoomEffect, type RepeatingZoomParams } from "./effects/repeating-zoom";

// Built-in properties (with decorators - auto-registered)
export { BlurProperty } from "./properties/blur";
export { PositionProperty } from "./properties/position";
export { ScaleProperty } from "./properties/scale";

// Base classes for custom plugins
export { BaseEffect, type CanvasTransform } from "./effects/base";
export { BaseProperty } from "./properties/base";

// Main factory API
export { getEffect, getProperty, LightRender, listEffects, listProperties } from "./light-render";
export type { LightRenderOptions, PluginRegistration } from "./light-render";
