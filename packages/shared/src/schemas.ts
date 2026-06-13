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
 */
export const PropertySchema = z.record(z.string(), z.unknown());

/**
 * Shared effect schema (dynamic, type-driven).
 */
export const EffectSchema = z.intersection(
    z.object({ type: z.string() }),
    z.record(z.string(), z.unknown()),
);

/**
 * Base layer schema with common fields.
 */
const BaseLayerSchema = z.object({
    id: z.string(),
    properties: z.record(z.string(), z.unknown()).optional().default({}),
    effects: z.array(EffectSchema).optional().default([]),
});

/**
 * Media layer schema (image/video) - requires src.
 */
const MediaLayerSchema = BaseLayerSchema.extend({
    type: z.enum(["image", "video"]),
    src: z.string(),
});

/**
 * Text layer schema - requires content, no src needed.
 */
const TextLayerSchema = BaseLayerSchema.extend({
    type: z.literal("text"),
    content: z.string(),
    fontSize: z.number().optional().default(48),
    color: z.string().optional().default("#ffffff"),
});

/**
 * Color layer schema - requires color value.
 */
const ColorLayerSchema = BaseLayerSchema.extend({
    type: z.literal("color"),
    color: z.string(),
});

/**
 * Discriminated union for all layer types.
 * Each type has its own required fields.
 */
export const LayerSchema = z.discriminatedUnion("type", [
    MediaLayerSchema,
    TextLayerSchema,
    ColorLayerSchema,
]);

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
