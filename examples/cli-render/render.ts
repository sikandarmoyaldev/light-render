// Node.js file system module for directory creation
import fs from "node:fs";

// Node.js path and URL modules for file resolution
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import core engine and JSON loader from the workspace package
import { LightRender, loadFromJson } from "@light-render/core/node";

// Resolve current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main execution function for the LightRender Phase 1 test.
 * Loads a JSON project, initializes the engine via LightRender factory, and renders a test video.
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

        // Load the FULL project from JSON (includes config + segments)
        const jsonPath = path.join(__dirname, "project.json");
        const project = loadFromJson(jsonPath);

        console.log(
            `✅ Loaded config: ${project.config.width}x${project.config.height} @ ${project.config.fps}fps`,
        );
        console.log(`✅ Loaded ${project.segments.length} segments`);

        // ✅ Initialize the rendering engine via LightRender factory
        // Built-in plugins auto-registered via decorators; custom config applied here
        const render = LightRender({
            // Optional: override project config defaults
            // width: project.config.width,
            // height: project.config.height,
            // fps: project.config.fps,
            // codec: project.config.codec,
            // quality: project.config.quality,
            // Optional: register custom plugins
            // effects: [{ name: "my-effect", plugin: MyEffectClass }],
            // properties: [{ name: "my-prop", plugin: MyPropertyClass }],
        });

        // Define the final output path inside the temp folder
        const outputPath = path.join(tempDir, "final_video.mp4");

        // ✅ Render the FULL project (config + segments) to output path
        await render.render(project, outputPath);

        console.log("🎉 Success! Video generated at:", outputPath);
    } catch (error) {
        console.error("❌ Rendering failed:", error);
        process.exit(1);
    }
}

// Execute the main function
main();
