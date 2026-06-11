import type { PreviewProject } from "@light-render/core";
import { LightRenderPlayer } from "@light-render/player";

export function RepeatingZoomExample() {
    // 1. Define the project structure (composition + timeline + layers)
    const exampleProject: PreviewProject = {
        composition: {
            width: 1920,
            height: 1080,
            fps: 30,
        },
        segments: [
            {
                id: 1,
                durationSeconds: 10,
                layers: [
                    {
                        id: "foreground",
                        name: "foreground",
                        positionX: 50,
                        positionY: 50,
                        scale: 1,
                        blur: 0,
                        media: {
                            type: "image",
                            // Using one of your sample images
                            src: "https://i.pinimg.com/736x/13/be/95/13be95147b920e7c4ee958ff30db7a11.jpg",
                        },
                        properties: {},
                        // 2. Apply the effect as a JSON configuration object
                        effects: [
                            {
                                type: "repeating-zoom",
                                strength: 1.2,
                                zoomInDuration: 2,
                                zoomOutDuration: 2,
                                pauseDuration: 1,
                                easing: "ease-in-out",
                            },
                        ],
                    },
                ],
            },
        ],
    };

    return (
        <div className="w-full max-w-2xl mx-auto border rounded-lg overflow-hidden shadow-lg">
            {/* 3. Pass the project object to the player */}
            <LightRenderPlayer project={exampleProject} autoPlay={true} loop={true} />
        </div>
    );
}
