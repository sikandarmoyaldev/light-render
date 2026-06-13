// Import schemas and types for validation
import { EffectSchema, LayerSchema, ProjectSchema, PropertySchema, SegmentSchema } from "./schemas";
import type { Effect, Layer, Project, Segment } from "./types";

/**
 * Validates and cleans raw layer data.
 */
export function validateLayer(data: unknown): Layer {
    const parsed = LayerSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid layer data: ${parsed.error.message}`);
    }
    return parsed.data;
}

/**
 * Validates and cleans raw segment data.
 */
export function validateSegment(data: unknown): Segment {
    const parsed = SegmentSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid segment data: ${parsed.error.message}`);
    }
    return parsed.data;
}

/**
 * Validates and cleans the entire project payload.
 */
export function validateProject(data: unknown): Project {
    const parsed = ProjectSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid project data: ${parsed.error.message}`);
    }
    return parsed.data;
}

/**
 * Validates and cleans raw effect data.
 */
export function validateEffect(data: unknown): Effect {
    const parsed = EffectSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid effect data: ${parsed.error.message}`);
    }
    return parsed.data;
}

/**
 * Validates and cleans raw property data.
 */
export function validateProperty(data: unknown): Record<string, unknown> {
    const parsed = PropertySchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid property data: ${parsed.error.message}`);
    }
    return parsed.data;
}
