// Node.js file system module for directory creation
import fs from "node:fs";

// Node.js path and URL modules for file resolution
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import core engine and JSON loader from the workspace package
import { Engine, loadFromJson } from "@light-render/core";

// Resolve current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main execution function for the LightRender Phase 1 test.
 * Loads a JSON project, initializes the engine, and renders a test video.
 */
async function main() {
    try {
        console.log("🚀 LightRender Phase 1 Test Starting...");

        // Define the path for the temporary output directory
        const tempDir = path.join(process.cwd(), "temp");

        // Create the temp folder if it does not already exist
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log(`📁 Created temporary directory at: ${tempDir}`);
        }

        // Load and validate the JSON project file
        const jsonPath = path.join(__dirname, "project.json");
        const { config, segments } = loadFromJson(jsonPath);

        console.log(`✅ Loaded config: ${config.width}x${config.height} @ ${config.fps}fps`);
        console.log(`✅ Loaded ${segments.length} segments`);

        // Initialize the rendering engine with the loaded config
        const engine = new Engine(config);

        // Define the final output path inside the temp folder and execute render
        const outputPath = path.join(tempDir, "final_video.mp4");
        await engine.render(segments, outputPath);

        console.log("🎉 Success! Video generated at:", outputPath);
    } catch (error) {
        console.error("❌ Rendering failed:", error);
        process.exit(1);
    }
}

// Execute the main function
main();
