# @light-render/core

The central engine for LightRender. This package is responsible for parsing project JSON files and translating them into visual output, whether that means drawing to an HTML5 Canvas or spawning an FFmpeg child process.

## Architecture

- **Browser:** Exposes `renderFrame()` to draw layer compositions, effects, and properties directly to a 2D Canvas context.
- **Node.js:** Exposes the `Engine` and `FfmpegRenderer` to compile complex `filter_complex` graphs (e.g., 9K oversampling for repeating zooms) and execute native FFmpeg binaries.

## Plugin Registration

Register custom effects easily:

```typescript
import { LightRender, BaseEffect } from "@light-render/core";

class MyCustomEffect extends BaseEffect {
    // Implement calculateCanvasTransform & buildFfmpegFilterString
}

const instance = LightRender({
    effects: [{ name: "my-custom-effect", plugin: MyCustomEffect }],
});
```
