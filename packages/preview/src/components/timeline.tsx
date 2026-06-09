interface TimelineProps {
    currentTime: number;
    totalDuration: number;
    onSeek: (time: number) => void;
}

export const Timeline = ({ currentTime, totalDuration, onSeek }: TimelineProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSeek(parseFloat(e.target.value));
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
                style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums", minWidth: "60px" }}
            >
                {currentTime.toFixed(2)}s
            </span>
            <input
                type="range"
                min={0}
                max={totalDuration}
                step={0.01}
                value={currentTime}
                onChange={handleChange}
                style={{ flex: 1, cursor: "pointer" }}
            />
            <span
                style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums", minWidth: "60px" }}
            >
                {totalDuration.toFixed(2)}s
            </span>
        </div>
    );
};
