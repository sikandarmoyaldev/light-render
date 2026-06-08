import fs from "fs";

// Import shared schema and core classes
import { ProjectSchema } from "@light-render/shared";
import { Config } from "../core/config.js";
import { Segment } from "../core/segment.js";

/**
 * Load config and segments from a JSON file.
 * Validates against the shared Zod schema before instantiation.
 */
export function loadFromJson(jsonPath: string): { config: Config; segments: Segment[] } {
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(rawData);

    // Strict validation
    const validated = ProjectSchema.parse(data);

    // Instantiate core classes
    const config = new Config(validated.config);
    const segments = validated.segments.map((seg) => Segment.fromDict(seg));

    return { config, segments };
}
