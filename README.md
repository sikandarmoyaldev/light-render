# 🎬 LightRender

A high-performance, unified video rendering engine. LightRender achieves **100% visual parity** between real-time browser previews (HTML5 Canvas API) and server-side video encoding (Native FFmpeg execution graphs).

## 🚀 Features

- **Unified Architecture:** Write an effect or property configuration once. Render it butter-smooth at 60fps within the browser context, and compile it to cinematic, sub-pixel perfect MP4 files on the backend.
- **Zero Bundle Bloat (Shadcn-Style):** A pluggable registry system. Add only the exact effects and properties you need directly to your codebase via CLI. No heavy dependencies, no tree-shaking guesswork.
- **Extensible Plugin System:** Track layout parameters easily. Register custom timeline alterations or visual overlays dynamically using the core registration factory engine.
- **React-Ready Component:** Drop the performance-optimized `<LightRenderPlayer />` directly into web application views for immediate, synchronous playback.
- **Environment Agnostic Core:** Smart runtime orchestration factory delegates calculations between web `renderFrame` cycles and server-side `Engine` execution steps seamlessly.

## 📦 Workspace Structure

### Core Packages

- **[@light-render/core](./packages/core/README.md):** The operational engine. Houses real-time canvas orchestration loops, FFmpeg child-process generation, and plugin registries.
- **[@light-render/player](./packages/player/README.md):** The user interface layer. A high-efficiency React viewport component containing pre-bound timeline handlers and interactive play states.
- **[@light-render/shared](./packages/shared/README.md):** The structural glue. Centralizes runtime-agnostic structures, static data types, and Zod configuration schema validation filters.

### Applications

- **[apps/docs](./apps/docs/README.md):** 🌟 The interactive documentation site. Features Starlight-powered guides and live, copy-pasteable React playgrounds for every effect and property.

### Examples

- **[examples/cli-render](./examples/cli-render/README.md):** Minimalist Node.js worker demonstrating headless high-throughput media encoding via native FFmpeg binaries.
- **[examples/preview-app](./examples/preview-app/README.md):** Interactive Vite + React workspace showcasing parameter adjustments and synchronized canvas timeline execution.

## 🛠 Quick Start

### 1. Install Monorepo Dependencies

Provision the global workspace graph using `pnpm` from the monorepo root:

```bash
pnpm install
```

### 2. Boot the Local Preview Workspace

Spin up the real-time development playground to review interactive player components:

```bash
pnpm example:preview
```

### 3. Trigger a Headless Backend Render Pass

Execute the CLI rendering loop to compile raw timeline configurations into a production-ready MP4 asset:

```bash
pnpm example:render
```

### 4. Boot the Interactive Documentation & Playgrounds

Spin up the Astro + Starlight docs site to see live previews of all effect

```bash
pnpm --filter docs dev
```

## 🤝 Contributing

We welcome contributions! Whether it's adding a new visual effect to the core registry, improving the FFmpeg filter graphs, or building a new interactive playground for the docs.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit effects to the registry and maintain 100% Canvas/FFmpeg parity.
