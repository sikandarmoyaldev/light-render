import type { PreviewProject } from "@light-render/preview";

/**
 * Example project matching the FFmpeg render test case.
 * Demonstrates:
 * - Background blur + scale
 * - Repeating zoom effect on foreground
 * - Multi-segment timeline
 */
export const exampleProject: PreviewProject = {
    composition: {
        width: 1920,
        height: 1080,
        fps: 30,
    },
    segments: [
        {
            id: 1,
            durationSeconds: 15,
            layers: [
                {
                    id: "background",
                    name: "background",
                    positionX: 50,
                    positionY: 50,
                    scale: 3,
                    blur: 25,
                    media: {
                        type: "image",
                        src: "https://i.pinimg.com/736x/13/be/95/13be95147b920e7c4ee958ff30db7a11.jpg",
                    },
                    properties: {},
                    effects: [],
                },
                {
                    id: "foreground",
                    name: "foreground",
                    positionX: 50,
                    positionY: 50,
                    scale: 1,
                    blur: 0,
                    media: {
                        type: "image",
                        src: "https://i.pinimg.com/736x/13/be/95/13be95147b920e7c4ee958ff30db7a11.jpg",
                    },
                    properties: {},
                    effects: [
                        {
                            type: "repeating-zoom",
                            strength: 1.15,
                            zoomInDuration: 3,
                            zoomOutDuration: 3,
                            pauseDuration: 3,
                            easing: "ease-in-out",
                        },
                    ],
                },
            ],
        },
        {
            id: 2,
            durationSeconds: 5,
            layers: [
                {
                    id: "background",
                    name: "background",
                    positionX: 50,
                    positionY: 50,
                    scale: 3,
                    blur: 25,
                    media: {
                        type: "image",
                        src: "https://i.pinimg.com/736x/1b/0d/6d/1b0d6db5f3384645c3d72858bea57301.jpg",
                    },
                    properties: {},
                    effects: [],
                },
                {
                    id: "foreground",
                    name: "foreground",
                    positionX: 50,
                    positionY: 50,
                    scale: 1,
                    blur: 0,
                    media: {
                        type: "image",
                        src: "https://i.pinimg.com/736x/1b/0d/6d/1b0d6db5f3384645c3d72858bea57301.jpg",
                    },
                    properties: {},
                    effects: [],
                },
            ],
        },
        {
            id: 3,
            durationSeconds: 5,
            layers: [
                {
                    id: "background",
                    name: "background",
                    positionX: 50,
                    positionY: 50,
                    scale: 5,
                    blur: 25,
                    media: {
                        type: "image",
                        src: "https://i.pinimg.com/474x/1b/e4/88/1be4887ab171cd498e51685d5a67479d.jpg",
                    },
                    properties: {},
                    effects: [],
                },
                {
                    id: "foreground",
                    name: "foreground",
                    positionX: 50,
                    positionY: 50,
                    scale: 1.5,
                    blur: 0,
                    media: {
                        type: "image",
                        src: "https://i.pinimg.com/474x/1b/e4/88/1be4887ab171cd498e51685d5a67479d.jpg",
                    },
                    properties: {},
                    effects: [],
                },
            ],
        },
    ],
};
