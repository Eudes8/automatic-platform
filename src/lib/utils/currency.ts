
/**
 * Utilitaire de gestion monétaire d'élite pour AUTOMATIC
 */

const EXCHANGE_RATES = {
    EUR_XOF: 655.957,
    USD_XOF: 600, // Approximation ajustable
};

export type Currency = 'EUR' | 'XOF' | 'USD';

export function formatCurrency(amount: number, targetCurrency: Currency = 'XOF') {
    let finalAmount = amount;

    // Si la base est en EUR (standard de l'entreprise) et la cible en XOF
    if (targetCurrency === 'XOF') {
        finalAmount = amount * EXCHANGE_RATES.EUR_XOF;
    }

    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: targetCurrency,
        maximumFractionDigits: 0,
    }).format(finalAmount);
}

const CURRENCY_COOKIE_NAME = 'automatic_preferred_currency';

export function getClientCurrency(): Currency {
    if (typeof window === 'undefined') return 'EUR';

    // 1. Check Cookie (Set by Middleware or UI)
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() as Currency;
    };

    const cookieVal = getCookie(CURRENCY_COOKIE_NAME);
    if (cookieVal && ['EUR', 'XOF', 'USD'].includes(cookieVal)) return cookieVal;

    // 2. Check localStorage fallback
    const stored = localStorage.getItem(CURRENCY_COOKIE_NAME) as Currency;
    if (stored && ['EUR', 'XOF', 'USD'].includes(stored)) return stored;

    // 3. Timezone fallback
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Abidjan') || tz.includes('Africa/Abidjan') || tz.includes('Dakar')) {
        return 'XOF';
    }

    return 'EUR';
}

export function setStoredCurrency(currency: Currency) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENCY_COOKIE_NAME, currency);
        document.cookie = `${CURRENCY_COOKIE_NAME}=${currency}; path=/; max-age=${60 * 60 * 24 * 365}`;

        // Force reload or event to sync UI
        window.dispatchEvent(new Event('currencyChange'));
    }
}
