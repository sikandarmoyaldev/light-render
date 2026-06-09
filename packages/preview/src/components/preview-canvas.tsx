import { useEffect, useRef } from "react";

import { renderFrame } from "../renderers/canvas-renderer";
import type { PreviewProject } from "../types";

interface PreviewCanvasProps {
    project: PreviewProject;
    currentTime: number;
    width?: number;
    height?: number;
}

export const PreviewCanvas = ({ project, currentTime }: PreviewCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { width: projWidth, height: projHeight } = project.composition;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        renderFrame(ctx, project, currentTime);
    }, [project, currentTime]);

    return (
        <canvas
            ref={canvasRef}
            width={projWidth}
            height={projHeight}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#000",
            }}
        />
    );
};
