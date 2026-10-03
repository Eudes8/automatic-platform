// Proxy Neon Auth : transmet toutes les requêtes /api/auth/* au service
// Better Auth managé (inscription, connexion, session, mot de passe…).
import { auth } from "@/lib/auth-server";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
