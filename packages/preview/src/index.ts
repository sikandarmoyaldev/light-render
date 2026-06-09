// Main component
export { Controls } from "./components/controls";
export { Preview } from "./components/preview";
export { PreviewCanvas } from "./components/preview-canvas";
export { Timeline } from "./components/timeline";

// Hook
export { usePlayback } from "./hooks/use-playback";

// Renderer
export { renderFrame } from "./renderers/canvas-renderer";

// Base classes (for custom plugins)
export { BaseEffect, type EffectTransform } from "./base/base-effect";
export { BaseProperty } from "./base/base-property";

// Registry
export { clearImageCache, loadImage } from "./utils/image-cache";
export {
    effectRegistry,
    propertyRegistry,
    type PluginClass,
    type RegisterOptions,
} from "./utils/registry";

// Built-in properties (auto-registered via decorators)
export { BlurProperty } from "./properties/blur";
export { PositionProperty } from "./properties/position";
export { ScaleProperty } from "./properties/scale";

// Built-in effects (auto-registered via decorators)
export { RepeatingZoomEffect, type RepeatingZoomParams } from "./effects/repeating-zoom";

// Types
export type { CompositionConfig, MediaSource, PreviewProject, RawLayer, RawSegment } from "./types";
