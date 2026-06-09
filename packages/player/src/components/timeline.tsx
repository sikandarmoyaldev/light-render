import React, { useCallback, useEffect, useRef, useState } from "react";

export interface TimelineProps {
    value: number;
    max: number;
    onChange: (value: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ value, max, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const calculateValue = useCallback(
        (clientX: number): number => {
            if (!trackRef.current) return value;

            const rect = trackRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            return percent * max;
        },
        [max, value],
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        onChange(calculateValue(e.clientX));
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            onChange(calculateValue(e.clientX));
        },
        [isDragging, calculateValue, onChange],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const percent = max > 0 ? (value / max) * 100 : 0;

    return (
        <div
            ref={trackRef}
            style={{
                flex: 1,
                height: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "2px",
                cursor: "pointer",
                position: "relative",
            }}
            onMouseDown={handleMouseDown}
            role="slider"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label="Video timeline"
        >
            {/* Progress bar */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${percent}%`,
                    backgroundColor: "#fff",
                    borderRadius: "2px",
                }}
            />

            {/* Thumb (only show when dragging or hovering) */}
            {(isDragging || percent > 0) && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: `${percent}%`,
                        transform: "translate(-50%, -50%)",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        border: "2px solid #000",
                        display: isDragging ? "block" : "none",
                    }}
                />
            )}
        </div>
    );
};
