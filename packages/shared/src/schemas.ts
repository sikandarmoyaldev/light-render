// Zod library for strict schema validation
import { z } from "zod";

/**
 * Shared configuration schema for rendering parameters.
 */
export const ConfigSchema = z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
    fps: z.number().default(30),
    codec: z.string().default("h264"),
    quality: z.string().default("high"),
});

/**
 * Shared property schema (dynamic key-value pairs).
 * Uses `unknown` to maintain strict type safety without `any`.
 */
export const PropertySchema = z.record(z.string(), z.unknown());

/**
 * Shared effect schema (dynamic, type-driven).
 * Uses intersection to guarantee `type` exists while allowing unknown extra properties.
 */
export const EffectSchema = z.intersection(
    z.object({ type: z.string() }),
    z.record(z.string(), z.unknown()),
);

/**
 * Shared layer schema for visual elements.
 */
export const LayerSchema = z.object({
    id: z.string(),
    src: z.string(),
    type: z.enum(["image", "video", "text", "color"]).default("image"),
    properties: z.record(z.string(), z.unknown()).optional().default({}),
    effects: z.array(EffectSchema).optional().default([]),
});

/**
 * Shared segment schema representing a timeline chunk.
 */
export const SegmentSchema = z.object({
    id: z.union([z.string(), z.number()]),
    duration: z.number(),
    audio: z.string().optional(),
    layers: z.array(LayerSchema),
});

/**
 * Master project schema combining config and segments.
 */
export const ProjectSchema = z.object({
    config: ConfigSchema,
    segments: z.array(SegmentSchema),
});
