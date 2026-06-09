import { LightRenderPlayer } from "@light-render/player";
import { exampleProject } from "./data/example-project";

function App() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                backgroundColor: "#111",
                color: "#fff",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            <h1 style={{ marginBottom: "20px", fontWeight: "normal", fontSize: "1.5rem" }}>
                🎬 LightRender Player
            </h1>

            <div style={{ width: "100%", maxWidth: "1200px" }}>
                <LightRenderPlayer
                    project={exampleProject}
                    autoPlay={true}
                    loop={true}
                    onTimeUpdate={(time) => console.log("Current time:", time.toFixed(2))}
                    onPlay={() => console.log("Playing")}
                    onPause={() => console.log("Paused")}
                    onEnd={() => console.log("Ended")}
                />
            </div>

            <p style={{ marginTop: "20px", fontSize: "0.875rem", opacity: 0.7 }}>
                Keyboard shortcuts: <kbd>Space</kbd> Play/Pause • <kbd>J</kbd>/<kbd>L</kbd> Seek •{" "}
                <kbd>F</kbd> Fullscreen
            </p>
        </div>
    );
}

export default App;
