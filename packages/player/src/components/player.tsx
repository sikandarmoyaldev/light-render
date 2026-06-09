import type { PreviewProject } from "@light-render/core";
import { renderFrame } from "@light-render/core";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { usePlayer } from "../hooks/use-player";
import { Controls } from "./controls";

export interface LightRenderPlayerProps {
    project: PreviewProject;
    autoPlay?: boolean;
    loop?: boolean;
    width?: number;
    height?: number;
    onTimeUpdate?: (time: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnd?: () => void;
}

export const LightRenderPlayer: React.FC<LightRenderPlayerProps> = ({
    project,
    autoPlay = false,
    loop = true,
    width,
    height,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnd,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { currentTime, duration, isPlaying, playbackRate, toggle, seek, setPlaybackRate } =
        usePlayer({ project, autoPlay, loop, onTimeUpdate, onPlay, onPause, onEnd });

    const { composition } = project;
    const displayWidth = width ?? composition.width;
    const _displayHeight = height ?? composition.height;

    // Render canvas frame
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        renderFrame(ctx, project, currentTime);
    }, [project, currentTime]);

    // Keyboard shortcuts (matches HTML5 video)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.code) {
                case "Space":
                case "k":
                    e.preventDefault();
                    toggle();
                    break;
                case "ArrowLeft":
                case "j":
                    e.preventDefault();
                    seek(Math.max(0, currentTime - 5));
                    break;
                case "ArrowRight":
                case "l":
                    e.preventDefault();
                    seek(Math.min(duration, currentTime + 5));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    // Volume up (future)
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    // Volume down (future)
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "m":
                    e.preventDefault();
                    // Mute (future)
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentTime, duration, toggle, seek]);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className="lr-player"
            style={{
                position: "relative",
                width: "100%",
                maxWidth: displayWidth,
                backgroundColor: "#000",
                borderRadius: isFullscreen ? 0 : "8px",
                overflow: "hidden",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Canvas Area */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: `${composition.width} / ${composition.height}`,
                    backgroundColor: "#000",
                    cursor: "pointer",
                }}
                onClick={toggle}
            >
                <canvas
                    ref={canvasRef}
                    width={composition.width}
                    height={composition.height}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                    }}
                />

                {/* Play/Pause Overlay (shows when paused) */}
                {!isPlaying && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "none",
                        }}
                    >
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0.8 }}
                        >
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <Controls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                playbackRate={playbackRate}
                onToggle={toggle}
                onSeek={seek}
                onRateChange={setPlaybackRate}
                onFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
            />
        </div>
    );
};
