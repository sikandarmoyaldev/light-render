import type { PreviewProject } from "@light-render/core";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePlayerOptions {
    project: PreviewProject;
    autoPlay?: boolean;
    loop?: boolean;
    onTimeUpdate?: (time: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnd?: () => void;
}

export const usePlayer = ({
    project,
    autoPlay = false,
    loop = true,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnd,
}: UsePlayerOptions) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [playbackRate, setPlaybackRate] = useState(1);

    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    // Calculate total duration from project segments
    const duration = project.segments.reduce((acc, segment) => acc + segment.durationSeconds, 0);

    const tick = useCallback(
        (timestamp: number) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = timestamp;
            }

            const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
            lastTimeRef.current = timestamp;

            setCurrentTime((prev) => {
                let nextTime = prev + deltaTime * playbackRate;

                if (nextTime >= duration) {
                    if (loop) {
                        nextTime = nextTime % duration;
                    } else {
                        nextTime = duration;
                        setIsPlaying(false);
                        onEnd?.();
                    }
                }
                return nextTime;
            });

            animationFrameRef.current = requestAnimationFrame(tick);
        },
        [playbackRate, duration, loop, onEnd],
    );

    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = null;
            animationFrameRef.current = requestAnimationFrame(tick);
            onPlay?.();
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            onPause?.();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, tick, onPlay, onPause]);

    // Notify parent of time updates
    useEffect(() => {
        onTimeUpdate?.(currentTime);
    }, [currentTime, onTimeUpdate]);

    const toggle = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    const play = useCallback(() => setIsPlaying(true), []);
    const pause = useCallback(() => setIsPlaying(false), []);
    const seek = useCallback(
        (time: number) => {
            setCurrentTime(Math.max(0, Math.min(time, duration)));
        },
        [duration],
    );

    return {
        currentTime,
        duration,
        isPlaying,
        playbackRate,
        play,
        pause,
        toggle,
        seek,
        setPlaybackRate,
    };
};
