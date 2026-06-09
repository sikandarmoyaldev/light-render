const imageCache = new Map<string, HTMLImageElement>();

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    if (imageCache.has(src)) {
        const img = imageCache.get(src)!;
        if (img.complete) return Promise.resolve(img);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();

        // ✅ FIX: Removed `img.crossOrigin = "anonymous"`
        // Pinterest and many CDNs block CORS requests.
        // Since we are only drawing to the canvas for visual preview
        // (not exporting pixel data via toDataURL/getImageData),
        // we don't need CORS and can safely load the image normally.

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
