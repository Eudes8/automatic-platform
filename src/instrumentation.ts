// Instrumentation Next.js — exécutée une seule fois au démarrage du serveur.
// Permet de semer la base de données de démonstration automatiquement.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { seedDatabase } = await import("@/lib/seed")
      await seedDatabase()
    } catch (e) {
      console.error("[instrumentation] seed failed:", e)
    }
  }
}
