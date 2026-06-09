# @light-render/player

A drop-in React component for playing LightRender projects in the browser. It handles time state, rendering loops, and user interaction.

## Installation & Usage

```tsx
import { LightRenderPlayer } from "@light-render/player";

export function App() {
    return (
        <LightRenderPlayer
            project={myProjectData}
            autoPlay={true}
            loop={true}
            onTimeUpdate={(time) => console.log(time)}
        />
    );
}
```

### Keyboard Shortcuts

The player automatically binds standard HTML5 video shortcuts when focused:

- Space / K: Play/Pause
- J / ArrowLeft: Seek backwards 5s
- L / ArrowRight: Seek forwards 5s
- F: Toggle Fullscreen
