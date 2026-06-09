import { Preview } from "@light-render/preview";
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
            }}
        >
            <h1 style={{ marginBottom: "20px", fontWeight: "normal" }}>
                🎬 LightRender Live Preview
            </h1>

            <div style={{ width: "100%", maxWidth: "1200px" }}>
                <Preview project={exampleProject} autoPlay={true} loop={true} />
            </div>
        </div>
    );
}

export default App;
