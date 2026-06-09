# 📚 LightRender Docs

The official interactive documentation and live preview playground for [LightRender](../../README.md).

Built with [Astro](https://astro.build/), [Starlight](https://starlight.astro.build/), and React, this site doesn't just show you how to use LightRender—it lets you **play with it in real-time**.

## ✨ Features

- **Live Interactive Playgrounds:** Every effect and property has a dedicated React Island. Tweak parameters with sliders and see the Canvas render update at 60fps instantly.
- **Dynamic Code Generation:** Adjust the visual parameters, and watch the JSON configuration update in real-time. Copy and paste it directly into your project.
- **Shadcn-Style Registry:** Browse the visual registry of effects. Learn how to add them to your project using the LightRender CLI without bloating your bundle.
- **Dark/Light Mode:** Native, beautifully themed dark and light modes powered by Starlight.

## 🚀 Project Structure

Inside this Astro project, you'll see the following folders:

```bash
apps/docs/
├── public/
│   └── registry.json       # The shadcn-style registry manifest
├── src/
│   ├── components/         # 🌟 React Islands (Playgrounds, UI components)
│   │   ├── ui/             # shadcn UI primitives
│   │   └── EffectPlayground.tsx
│   ├── content/
│   │   ├── config.ts       # Starlight sidebar and navigation config
│   │   └── docs/           # The actual MDX documentation pages
│   └── styles/             # Global CSS and Tailwind overrides
├── astro.config.mjs        # Astro & Starlight configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 🤝 Contributing to the Docs

Want to add a new effect to the registry and document it?

1. Add your effect logic to `packages/core`.
2. Create a new `.mdx` file in `src/content/docs/effects/`.
3. Embed the `<EffectPlayground effectName="your-effect" />` React component.
4. Update `public/registry.json` so the CLI can fetch it.

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for more details on the submission pipeline.
