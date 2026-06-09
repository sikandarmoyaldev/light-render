import { useCallback, useEffect, useRef, useState } from "react";
import type { PreviewProject } from "../types";

interface UsePlaybackProps {
    project: PreviewProject;
    autoPlay?: boolean;
    loop?: boolean;
}

export const usePlayback = ({ project, autoPlay = false, loop = true }: UsePlaybackProps) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [playbackRate, setPlaybackRate] = useState(1);

    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    const totalDuration = project.segments.reduce((acc, seg) => acc + seg.durationSeconds, 0);

    const tick = useCallback(
        (timestamp: number) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = timestamp;
            }

            const deltaTime = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            setCurrentTime((prev) => {
                let nextTime = prev + deltaTime * playbackRate;

                if (nextTime >= totalDuration) {
                    if (loop) {
                        nextTime = nextTime % totalDuration;
                    } else {
                        nextTime = totalDuration;
                        setIsPlaying(false);
                    }
                }
                return nextTime;
            });

            animationFrameRef.current = requestAnimationFrame(tick);
        },
        [playbackRate, totalDuration, loop],
    );

    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = null;
            animationFrameRef.current = requestAnimationFrame(tick);
        } else if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, tick]);

    const togglePlay = () => setIsPlaying((prev) => !prev);
    const seek = (time: number) => setCurrentTime(Math.max(0, Math.min(time, totalDuration)));

    return {
        currentTime,
        totalDuration,
        isPlaying,
        playbackRate,
        togglePlay,
        seek,
        setPlaybackRate,
    };
};
