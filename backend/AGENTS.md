# NestJS backend instructions

These instructions apply to `backend/`. Run backend commands from this directory.

## Project structure

- Organize code by NestJS module. For example, keep `products.module.ts`, `products.controller.ts`, and `products.service.ts` together in `src/products/`. Keep services next to their owning module.
- `src/main.ts` starts the application. `AppModule` imports the application modules. Each module registers its controllers and providers and exports only what other modules use.
- Controllers handle HTTP requests and delegate work to services. Services implement use cases and enforce business rules. Validate incoming data at the HTTP boundary.
- Keep shared backend types and interfaces in the owning module's `interfaces/` directory. Use files named for the domain, such as `src/products/interfaces/product.interface.ts` and `src/cart/interfaces/cart.interface.ts`.
- Define `as const` values used to derive types in the same `<entity>.interface.ts` file as those types. For example, keep `ordersStatusesMap` and `OrderStatus` together in `src/orders/interfaces/orders.interface.ts`. Keep other reusable constants in `constants/index.ts`.
- Keep Zod-inferred DTO types beside their schemas in the module's `schemas/` directory. Place DTO classes with decorators in the module's `dto/` directory. Create directories as the code needs them.
- Keep `userRolesMap`, the `UserRole` union derived from it, and the related user types in `src/users/interfaces/index.ts`.
- Move SQL into a repository within the module when queries make the service harder to read or need to be reused. SQL for simple use cases can stay in the service.

## PostgreSQL

- The `database` module owns the shared `pg.Pool` and closes it during graceful shutdown. SQL for products, carts, and orders belongs in the corresponding modules.
- Read connection settings from the environment. Keep a template without secrets in `.env.example` and local values in an untracked `.env` file.
- Use the existing `learning` database. Qualify store tables with their schema, for example `shop.products`. Check the actual database schema before changing it.
- Pass values to SQL as parameters. Run all statements in a transaction through the same client and release it back to the pool when the transaction ends, including on error.
- Preserve the precision of `bigint` and `numeric` values when mapping database results to API responses.

## TypeScript and verification

- Use named exports. Keep the `.js` extension in relative ESM imports. Use `import type` for imports used only in type positions.
- Use `?` for optional properties. Fix type and lint errors in the source code. Avoid type assertions and suppression directives. Use `as const` on `userRolesMap` to preserve the literal values used by `UserRole`.
- After changing code, run `npm run lint`, `npm run build`, and `npm test`. For changes to HTTP behavior, run `npm run test:e2e`.

## Learning workflow

- Treat every topic the user proposes as a learning task in every chat. Read `LEARNING_PROGRESS.md` at the start to see what the user has already learned and what remains.
- Before starting a new section, outline what it will cover. Explain the theory first and let the user describe it in their own words. Then give them a practical exercise with acceptance criteria.
- The user implements the solution, and the assistant reviews it. The goal is for the user to learn to do the work independently. Offer hints gradually when asked. If the user requests scaffolding or implementation of a specific part, limit edits to that part.
- Update `LEARNING_PROGRESS.md` after each reviewed milestone. Record what was learned, what was verified, and the next step.
