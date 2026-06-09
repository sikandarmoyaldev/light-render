// Image caching for 60fps performance
const imageCache = new Map<string, HTMLImageElement>();

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    if (imageCache.has(src)) {
        const img = imageCache.get(src)!;
        if (img.complete) return Promise.resolve(img);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imageCache.set(src, img);
            resolve(img);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
};

export const clearImageCache = () => {
    imageCache.clear();
};
