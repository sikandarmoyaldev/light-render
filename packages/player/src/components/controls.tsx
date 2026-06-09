import React from "react";

import { Timeline } from "./timeline";

export interface ControlsProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playbackRate: number;
    onToggle: () => void;
    onSeek: (time: number) => void;
    onRateChange: (rate: number) => void;
    onFullscreen: () => void;
    isFullscreen: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    onToggle,
    onSeek,
    onRateChange,
    onFullscreen,
    isFullscreen,
}) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
                fontSize: "12px",
            }}
        >
            {/* Play/Pause Button */}
            <button
                onClick={onToggle}
                style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    // Pause icon
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                    </svg>
                ) : (
                    // Play icon
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                )}
            </button>

            {/* Time Display */}
            <span style={{ minWidth: "80px", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Timeline */}
            <Timeline value={currentTime} max={duration} onChange={onSeek} />

            {/* Speed Control */}
            <select
                value={playbackRate}
                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                }}
                aria-label="Playback speed"
            >
                {[0.25, 0.5, 1, 1.25, 1.5, 2].map((rate) => (
                    <option key={rate} value={rate}>
                        {rate}x
                    </option>
                ))}
            </select>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Fullscreen Button */}
            <button
                onClick={onFullscreen}
                style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
                {isFullscreen ? (
                    // Exit fullscreen icon
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                ) : (
                    // Enter fullscreen icon
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                )}
            </button>
        </div>
    );
};
