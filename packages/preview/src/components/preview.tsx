import { usePlayback } from "../hooks/use-playback";
import type { PreviewProject } from "../types";
import { Controls } from "./controls";
import { PreviewCanvas } from "./preview-canvas";
import { Timeline } from "./timeline";

interface PreviewProps {
    project: PreviewProject;
    autoPlay?: boolean;
    loop?: boolean;
    width?: number;
    height?: number;
}

export const Preview = ({ project, autoPlay, loop, width }: PreviewProps): JSX.Element => {
    const {
        currentTime,
        totalDuration,
        isPlaying,
        playbackRate,
        togglePlay,
        seek,
        setPlaybackRate,
    } = usePlayback({ project, autoPlay, loop });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "20px",
                fontFamily: "sans-serif",
                color: "#fff",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                maxWidth: width ?? "100%",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: `${project.composition.width} / ${project.composition.height}`,
                    backgroundColor: "#000",
                    borderRadius: "4px",
                    overflow: "hidden",
                }}
            >
                <PreviewCanvas project={project} currentTime={currentTime} />
            </div>

            <Timeline currentTime={currentTime} totalDuration={totalDuration} onSeek={seek} />

            <Controls
                isPlaying={isPlaying}
                playbackRate={playbackRate}
                onTogglePlay={togglePlay}
                onSetPlaybackRate={setPlaybackRate}
            />
        </div>
    );
};
