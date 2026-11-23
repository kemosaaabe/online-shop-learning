# NestJS backend instructions

These instructions apply to `backend/`. Run backend commands from this directory.

## Project structure

- Organize code by NestJS module. For example, keep `products.module.ts`, `products.controller.ts`, and `products.service.ts` together in `src/products/`. Keep services next to their owning module.
- `src/main.ts` starts the application. `AppModule` imports the application modules. Each module registers its controllers and providers and exports only what other modules use.
- Controllers handle HTTP requests and delegate work to services. Services implement use cases and enforce business rules. Validate incoming data at the HTTP boundary.
- Place DTOs with decorators in the module's `dto/` directory, types and interfaces in `types/index.ts`, and reusable constants in `constants/index.ts`. Create directories as the code needs them.
- Move SQL into a repository within the module when queries make the service harder to read or need to be reused. SQL for simple use cases can stay in the service.

## PostgreSQL

- The `database` module owns the shared `pg.Pool` and closes it during graceful shutdown. SQL for products, carts, and orders belongs in the corresponding modules.
- Read connection settings from the environment. Keep a template without secrets in `.env.example` and local values in an untracked `.env` file.
- Use the existing `learning` database. Qualify store tables with their schema, for example `shop.products`. Check the actual database schema before changing it.
- Pass values to SQL as parameters. Run all statements in a transaction through the same client and release it back to the pool when the transaction ends, including on error.
- Preserve the precision of `bigint` and `numeric` values when mapping database results to API responses.

## TypeScript and verification

- Use named exports. Keep the `.js` extension in relative ESM imports. Use `import type` for imports used only in type positions.
- Use `?` for optional properties. Fix type and lint errors in the source code. Avoid type assertions and suppression directives.
- After changing code, run `npm run lint`, `npm run build`, and `npm test`. For changes to HTTP behavior, run `npm run test:e2e`.

## Learning workflow

- For learning tasks, explain the topic first and let the user describe it in their own words. Then give them a practical exercise and its acceptance criteria.
- The user writes the solution and the assistant reviews it. Offer hints gradually when asked. If the user requests scaffolding or implementation of a specific part, limit edits to that part.
