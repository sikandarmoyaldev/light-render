# Contributing to LightRender

## 🌿 Git Workflow & Commits

We follow a strict, linear commit history using specific prefixes.

**Allowed Commit Types:**

- `feat(scope)`: e.g., `feat(editor): add timeline dragging`
- `refactor(scope)`: e.g., `refactor(ui): extract player controls`
- `bug(scope)`: e.g., `bug(auth): fix token expiration`
- `chore(scope)`: e.g., `chore(docker): update image node version`

## 💻 Coding Standards

### React & UI

- Always prepend `"use client";` for React UI components.
- Strict styling: Use `bg-background` and `text-foreground` strictly.
- **❌ AVOID:** Gradients, extra padding, bloated code, and hardcoded margins like `mr-2`.
- Wrap component lists in `memo` and utilize lazy loading where applicable.

### Folder Structure

Stick to the standard feature-based architecture. Non-standard folders will be rejected.

```bash
src/
 ├─ app/
 ├─ components/ui/
 ├─ lib/
 └─ features/
     └─ [feature]/
         ├─ components/
         ├─ hooks/
         ├─ schema.ts
         └─ types.ts
```

### System & Infrastructure Rules

- Respect Docker limits: App max 4GB, DB max 2GB. Redis cache limited to 512MB.
- Keep database schema lean (PostgreSQL).
