interface ControlsProps {
    isPlaying: boolean;
    playbackRate: number;
    onTogglePlay: () => void;
    onSetPlaybackRate: (rate: number) => void;
}

export const Controls = ({
    isPlaying,
    playbackRate,
    onTogglePlay,
    onSetPlaybackRate,
}: ControlsProps) => {
    const rates = [0.25, 0.5, 1, 1.5, 2];

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
                onClick={onTogglePlay}
                style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                }}
            >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            <div style={{ display: "flex", gap: "4px" }}>
                {rates.map((rate) => (
                    <button
                        key={rate}
                        onClick={() => onSetPlaybackRate(rate)}
                        style={{
                            padding: "4px 8px",
                            cursor: "pointer",
                            backgroundColor: playbackRate === rate ? "#0066cc" : "#333",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                        }}
                    >
                        {rate}x
                    </button>
                ))}
            </div>
        </div>
    );
};
