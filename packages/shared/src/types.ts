// Import Zod and schemas to infer strict TypeScript types
import type { z } from "zod";

import type {
    ConfigSchema,
    EffectSchema,
    LayerSchema,
    ProjectSchema,
    SegmentSchema,
} from "./schemas";

// Export inferred TypeScript types for global use
export type Config = z.infer<typeof ConfigSchema>;
export type Layer = z.infer<typeof LayerSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Effect = z.infer<typeof EffectSchema>;

// Extract the strict union type directly from the Layer schema
export type LayerType = Layer["type"];
