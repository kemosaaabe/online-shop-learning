# React frontend instructions

## Scope

These instructions apply to `frontend/`. The frontend uses React, TypeScript, Vite, and npm. The entry point is `src/main.tsx`. Run frontend commands from `frontend/`.

## Project structure

- Keep related UI, state, types, and constants together in the module that owns them. Follow neighboring code when extending an existing module.
- As the app grows, use `src/app` for setup and providers, `src/pages` for route-level composition, `src/widgets` for composed UI sections, `src/features` for user workflows, `src/entities` for domain modules, and `src/shared` for reusable UI and utilities. Create a folder when there is code for it.
- Place reusable constants in the owning module's `constants/index.ts`. Use `camelCase` names. A one-off value without domain meaning can stay inline.
- Place type declarations, including component props, in the owning module's `types/index.ts`.
- Place model logic in `model/` and hooks in `model/hooks/`, with one hook per file named after the hook. Use `model/index.ts` and `model/hooks/index.ts` only for re-exports.
- Use a feature or entity's `index.ts` as its public API when other modules need it.
- Group imports in this order, with a blank line between groups: Node built-ins, third-party packages, configured internal aliases, relative imports, and stylesheets. Use relative imports until an alias is configured. Use `import type` for type-only imports.

## TypeScript and code style

- Use named exports in application code. Tool configuration files can use default exports when required.
- Use explicit types where they clarify contracts or guide inference. Rely on the declared types of already typed data.
- Use optional properties for optional fields. Avoid explicitly declaring `undefined` in types or assigning it as a value.
- Avoid `any`, type assertions, and TypeScript or ESLint suppressions. Fix the underlying error.
- Use descriptive names and keep files focused. Prefer simple, explicit solutions.
- Use braces for conditionals and loops, and block bodies for functions and callbacks. Separate logical groups with blank lines. Leave a blank line before a `return` that follows other statements in the same block.
- Add code comments only when explicitly requested.

## React

- Use function components. Keep render logic pure and call hooks at the top level of components or custom hooks.
- Keep state in the component that owns it. Lift state to the nearest common parent when components need to share it. Treat props and state as immutable and calculate derived values during render.
- Put user-triggered work in event handlers. Use effects to synchronize with external systems and clean up resources the effect owns, such as event listeners, timers, and object URLs.
- Use stable data IDs as list keys. Avoid array indexes as keys when items can move, be added, or be removed.
- Extract components that have a clear responsibility, are reused, or make their parent easier to read. Create hooks for reusable stateful logic.
- Use semantic HTML and accessible names for interactive controls. Connect form labels to their inputs with `htmlFor` and `id`, and provide text for icon-only controls. Give buttons an explicit `type` in forms.
- When a data-driven screen fetches asynchronously, account for loading, error, and empty states.

## Styles

- Use plain CSS and follow nearby styles. Keep global styles in `src/index.css` and component styles next to their components. Use Vite's `.module.css` convention when a component needs scoped styles.
- Reuse existing CSS custom properties. Start with styles for smaller screens and use `min-width` media queries for wider layouts.

## Verification

After changing frontend code, run these commands from `frontend/`:

```bash
npm run lint
npm run build
```

For UI changes, use `npm run dev` to check the affected interaction in the browser.
