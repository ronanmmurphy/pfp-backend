## Potraits for Patriots

### Migration

- Generate Migration

  ```
  npx typeorm-ts-node-commonjs migration:generate migrations/InitSchema -d ormconfig.ts
  ```

- Run Migration

  ```
  npx typeorm-ts-node-commonjs migration:run -d ormconfig.ts
  ```

- Rever Migration

  ```
  npx typeorm-ts-node-commonjs migration:revert -d ormconfig.ts
  ```

- Show Migrations
  ```
  npx typeorm-ts-node-commonjs migration:show -d ormconfig.ts
  ```
