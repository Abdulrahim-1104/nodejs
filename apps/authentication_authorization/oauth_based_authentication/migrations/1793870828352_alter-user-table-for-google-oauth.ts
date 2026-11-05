import type { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder): void => {
  pgm.sql(`
    ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

    ALTER TABLE users
    ADD COLUMN google_sub TEXT UNIQUE;
  `);
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.sql(`
    ALTER TABLE users
    DROP COLUMN google_sub;

    ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;
  `);
};
