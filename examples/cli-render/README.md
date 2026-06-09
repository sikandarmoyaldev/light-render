# CLI Render Example

A Node.js implementation demonstrating how to use `@light-render/core` to generate a final MP4 video using FFmpeg.

## Requirements

- FFmpeg must be installed and available in your system's `PATH`.

## How to Run

From the monorepo root:

```bash
pnpm example:render
```

## What it does

1. Instantiates the `LightRender` engine in a Node environment.
2. Reads the `project.json` layout.
3. Downloads remote assets to a local temp/assets directory.
4. Generates a highly optimized `filter_complex` graph.
5. Spawns an FFmpeg process to render the video to `temp/final_video.mp4`.
