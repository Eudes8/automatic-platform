"use client";

// Client Neon Auth côté navigateur.
// Sans argument : il parle au proxy same-origin /api/auth (voir
// src/app/api/auth/[...path]/route.ts) qui transmet au service managé.
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
