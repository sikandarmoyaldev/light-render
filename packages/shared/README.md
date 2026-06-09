# @light-render/shared

This package serves as the single source of truth for the LightRender data model.

It contains the TypeScript interfaces and validation logic (via Zod) required to ensure that a project configuration is valid before it reaches the `@light-render/core` engine or the `@light-render/player` UI.

- `Project`: The root configuration object.
- `Segment`: A specific block of time in the timeline.
- `Layer`: Media assets (images, video) with applied effects and properties.
