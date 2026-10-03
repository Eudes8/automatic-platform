import { Resend } from 'resend';

// Instanciation paresseuse : le client n'est créé qu'au premier envoi,
// pas à l'évaluation du module. Sinon `next build` échoue au stade
// « Collecting page data » quand RESEND_API_KEY n'est pas encore défini.
let instance: Resend | null = null;

function getClient(): Resend {
    if (!instance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error(
                "RESEND_API_KEY manquant : renseignez cette variable d'environnement (voir .env.example)."
            );
        }
        instance = new Resend(apiKey);
    }
    return instance;
}

// Proxy transparent : préserve l'API existante `import { resend } from "@/lib/resend"`.
export const resend: Resend = new Proxy({} as Resend, {
    get(_target, prop) {
        const client = getClient();
        const value = Reflect.get(client as object, prop, client);
        return typeof value === 'function' ? (value as (...args: never[]) => unknown).bind(client) : value;
    },
});
