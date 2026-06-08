// Main engine orchestrator
export { Engine } from './core/engine';

// Core data structures
export { Config } from './core/config.js';
export { Layer } from './core/layer.js';
export { Segment } from './core/segment.js';

// Plugin registries
export { effectRegistry, propertyRegistry } from './registry.js';

// Built-in effects
export { ZoomEffect } from './effects/zoom.js';
