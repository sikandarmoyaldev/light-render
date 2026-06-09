import type { BaseEffect } from "../effects/base";
import type { BaseProperty } from "../properties/base";
import type { PreviewProject, RawLayer, RawSegment } from "../types";
import { loadImage } from "../utils/image-cache";
import { effectRegistry, propertyRegistry } from "../utils/registry";

interface ParsedLayer {
    id: string | number;
    src: string;
    properties: Record<string, BaseProperty>;
    effects: BaseEffect[];
}

const parseLayer = (layer: RawLayer): ParsedLayer => {
    const properties: Record<string, BaseProperty> = {};
    const effects: BaseEffect[] = [];

    if (layer.properties) {
        for (const [propName, propData] of Object.entries(layer.properties)) {
            const propType = (propData.type as string) || propName;
            if (propertyRegistry.has(propType)) {
                const PropClass = propertyRegistry.get(propType);
                properties[propName] = PropClass.fromDict(propData) as BaseProperty;
            }
        }
    }

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
 * Uses unified property/effect methods for 100% parity with FFmpeg.
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

        // ✅ STEP 1: Calculate cover dimensions FIRST (before any transforms)
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let drawWidth: number;
        let drawHeight: number;

        if (imgAspectRatio > canvasAspectRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgAspectRatio;
        } else {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgAspectRatio;
        }

        ctx.save();

        // ✅ STEP 2: Move origin to center of canvas
        ctx.translate(canvasWidth / 2, canvasHeight / 2);

        // ✅ STEP 3: Apply ALL properties via unified method
        for (const property of Object.values(parsedLayer.properties)) {
            // ✅ UPDATED: Use new clear method name
            property.applyToCanvasContext(ctx, canvasWidth, canvasHeight, img.width, img.height);
        }

        // ✅ STEP 4: Apply ALL effects via unified method
        for (const effect of parsedLayer.effects) {
            // ✅ UPDATED: Use new clear method name
            const transform = effect.calculateCanvasTransform(timeInSegment, segmentDuration);

            if (transform.scale !== 1) {
                ctx.scale(transform.scale, transform.scale);
                drawWidth *= transform.scale;
                drawHeight *= transform.scale;
            }
            if (transform.offsetX !== 0 || transform.offsetY !== 0) {
                ctx.translate(transform.offsetX, transform.offsetY);
            }
        }

        // ✅ STEP 5: Draw image centered at origin with calculated dimensions
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        ctx.restore();
    } catch (error) {
        console.warn(`Failed to render layer ${parsedLayer.id}:`, error);
    }
};

export const renderFrame = async (
    ctx: CanvasRenderingContext2D,
    project: PreviewProject,
    currentTime: number,
): Promise<void> => {
    const { width, height } = project.composition;

    ctx.filter = "none";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

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
