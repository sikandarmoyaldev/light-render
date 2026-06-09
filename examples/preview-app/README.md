# Preview App Example

A React + Vite web application showcasing real-time playback of a LightRender project via the HTML5 Canvas API.

## How to Run

From the monorepo root:

```bash
pnpm example:preview
```

## What it does

This app mounts the `<LightRenderPlayer />` from `@light-render/player` and feeds it a sample JSON configuration. It processes properties (like `blur`) and complex mathematical effects (like `repeating-zoom`) in real-time, matching the exact mathematical easing curves used by the backend FFmpeg pipeline.
