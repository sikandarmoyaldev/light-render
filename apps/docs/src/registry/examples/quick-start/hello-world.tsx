import type { PreviewProject } from "@light-render/core";
import { LightRenderPlayer } from "@light-render/player";

export function HelloWorldPreview() {
    const project: PreviewProject = {
        composition: {
            width: 1920,
            height: 1080,
            fps: 30,
        },
        segments: [
            {
                id: 1,
                durationSeconds: 5,
                layers: [
                    {
                        id: "hello-text",
                        type: "text",
                        content: "Hello, World!",
                    },
                ],
            },
        ],
    };

    return (
        <div className="w-full max-w-2xl mx-auto border rounded-lg overflow-hidden shadow-lg">
            <LightRenderPlayer project={project} autoPlay={true} loop={true} />
        </div>
    );
}
