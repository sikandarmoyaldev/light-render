// Node.js file system module
import fs from "node:fs";

// Import shared validation utilities
import type { Project } from "@light-render/shared";
import { validateProject } from "@light-render/shared";

/**
 * Loads and validates a JSON project file.
 * Returns the raw validated project data (not instantiated classes).
 * The Engine will handle converting to core classes during render.
 *
 * @param filePath - Path to the JSON project file
 * @returns Validated project object with raw segment/layer data
 */
export function loadFromJson(filePath: string): Project {
    // Read the JSON file
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Parse JSON
    const rawData = JSON.parse(fileContent);

    // Validate using shared Zod schema
    const validatedProject = validateProject(rawData);

    // Return raw validated data (Engine will instantiate classes)
    return validatedProject;
}
