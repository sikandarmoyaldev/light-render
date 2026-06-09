import type { BaseEffect } from "../base/base-effect";
import type { BaseProperty } from "../base/base-property";
import type { PreviewProject, RawLayer, RawSegment } from "../types";
import { loadImage } from "../utils/image-cache";
import { effectRegistry, propertyRegistry } from "../utils/registry";

/**
 * Parsed layer with instantiated property/effect classes.
 * Mirrors the Layer class from @light-render/core.
 */
interface ParsedLayer {
    id: string | number;
    src: string;
    properties: Record<string, BaseProperty>;
    effects: BaseEffect[];
}

/**
 * Parses raw layer data into instantiated property/effect classes.
 * Uses the registries to look up the correct class for each plugin.
 */
const parseLayer = (layer: RawLayer): ParsedLayer => {
    const properties: Record<string, BaseProperty> = {};
    const effects: BaseEffect[] = [];

    // Parse properties via registry (same as core's Layer.fromDict)
    if (layer.properties) {
        for (const [propName, propData] of Object.entries(layer.properties)) {
            const propType = (propData.type as string) || propName;
            if (propertyRegistry.has(propType)) {
                const PropClass = propertyRegistry.get(propType);
                properties[propName] = PropClass.fromDict(propData) as BaseProperty;
            }
        }
    }

    // Parse effects via registry
    if (layer.effects) {
        for (const effectData of layer.effects) {
            const effectType = effectData.type as string;
            if (effectRegistry.has(effectType)) {
                const EffectClass = effectRegistry.get(effectType);
                effects.push(EffectClass.fromDict(effectData) as BaseEffect);
            }
        }
    }

    return {
        id: layer.id,
        src: layer.media.src,
        properties,
        effects,
    };
};

/**
 * Renders a single parsed layer onto the canvas context.
 *
 * Pipeline (matches FFmpeg's order):
 * 1. Save context state
 * 2. Translate to center of canvas
 * 3. Apply position offsets (via PositionProperty)
 * 4. Apply base scale (via ScaleProperty)
 * 5. Calculate and apply effect transforms (zoom, etc.)
 * 6. Apply blur filter (via BlurProperty)
 * 7. Draw image centered at origin
 * 8. Restore context state
 */
const renderLayer = async (
    ctx: CanvasRenderingContext2D,
    parsedLayer: ParsedLayer,
    canvasWidth: number,
    canvasHeight: number,
    timeInSegment: number,
    segmentDuration: number,
): Promise<void> => {
    try {
        const img = await loadImage(parsedLayer.src);

        ctx.save();

        // 1. Move origin to center of canvas
        ctx.translate(canvasWidth / 2, canvasHeight / 2);

        // 2. Apply all properties (position, scale, blur, etc.)
        for (const property of Object.values(parsedLayer.properties)) {
            property.applyToContext(ctx, canvasWidth, canvasHeight, img.width, img.height);
        }

        // 3. Apply all effects (zoom, etc.) - they return transform values
        let effectScale = 1;
        let effectOffsetX = 0;
        let effectOffsetY = 0;

        for (const effect of parsedLayer.effects) {
            const transform = effect.calculateTransform(timeInSegment, segmentDuration);
            effectScale *= transform.scale;
            effectOffsetX += transform.offsetX;
            effectOffsetY += transform.offsetY;
        }

        // Apply effect transforms
        if (effectScale !== 1) {
            ctx.scale(effectScale, effectScale);
        }
        if (effectOffsetX !== 0 || effectOffsetY !== 0) {
            ctx.translate(effectOffsetX, effectOffsetY);
        }

        // 4. Calculate draw dimensions (cover behavior - fills canvas)
        const aspectRatio = img.width / img.height;
        let drawWidth = canvasWidth;
        let drawHeight = canvasWidth / aspectRatio;

        if (drawHeight < canvasHeight) {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * aspectRatio;
        }

        // 5. Draw image centered at origin (since we translated to center)
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        ctx.restore();
    } catch (error) {
        console.warn(`Failed to render layer ${parsedLayer.id}:`, error);
    }
};

/**
 * Main render function - clears canvas and draws all active layers.
 * Called every frame by the React component.
 */
export const renderFrame = async (
    ctx: CanvasRenderingContext2D,
    project: PreviewProject,
    currentTime: number,
): Promise<void> => {
    const { width, height } = project.composition;

    // Clear canvas with black background
    ctx.filter = "none"; // Reset filter from previous frame
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Find active segment based on currentTime
    let accumulatedTime = 0;
    let activeSegment: RawSegment | null = null;
    let timeInSegment = 0;

    for (const segment of project.segments) {
        if (
            currentTime >= accumulatedTime &&
            currentTime < accumulatedTime + segment.durationSeconds
        ) {
            activeSegment = segment;
            timeInSegment = currentTime - accumulatedTime;
            break;
        }
        accumulatedTime += segment.durationSeconds;
    }

    if (!activeSegment) return;

    // Render layers in order (background first, foreground last)
    for (const rawLayer of activeSegment.layers) {
        const parsedLayer = parseLayer(rawLayer);
        await renderLayer(
            ctx,
            parsedLayer,
            width,
            height,
            timeInSegment,
            activeSegment.durationSeconds,
        );
    }
};
