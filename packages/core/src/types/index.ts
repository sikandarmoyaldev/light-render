// Shared types that match @light-render/core JSON format
export interface MediaSource {
    type: "image" | "video";
    src: string;
}

export interface RawLayer {
    id: string | number;
    name?: string;
    positionX?: number;
    positionY?: number;
    scale?: number;
    blur?: number;
    media: MediaSource;
    properties?: Record<string, Record<string, unknown>>;
    effects?: Array<Record<string, unknown>>;
}

export interface RawSegment {
    id: string | number;
    durationSeconds: number;
    layers: RawLayer[];
}

export interface CompositionConfig {
    width: number;
    height: number;
    fps: number;
}

export interface PreviewProject {
    composition: CompositionConfig;
    segments: RawSegment[];
}
