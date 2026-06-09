// Re-export browser-safe defaults
export * from "./index";

// ✅ Node.js-only exports for convenience
export { Config } from "./core/config";
export { Engine } from "./core/engine";
export { Layer } from "./core/layer";
export { Segment } from "./core/segment";
export { FfmpegRenderer } from "./renderers/ffmpeg-renderer";
export { loadFromJson } from "./utils/json-loader";
