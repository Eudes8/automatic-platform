import { defineConfig } from "@neon/config/v1";

// Configuration Neon Infrastructure-as-Code.
// - Postgres : présent par défaut sur chaque branche.
// - Auth : Better Auth managé (neon_auth) — sessions et utilisateurs
//   stockés dans le schéma neon_auth de la branche.
export default defineConfig({
    auth: true,
});
