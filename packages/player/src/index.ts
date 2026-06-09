// Main player component
export { LightRenderPlayer, type LightRenderPlayerProps } from "./components/player";

// Sub-components (for advanced customization)
export { Controls, type ControlsProps } from "./components/controls";
export { Timeline, type TimelineProps } from "./components/timeline";

// Hook (for custom player implementations)
export { usePlayer, type UsePlayerOptions } from "./hooks/use-player";

// Re-export core types for convenience
export type { CompositionConfig, PreviewProject } from "@light-render/core";
