import type { PaidPass, PaymentState, RegionPricing } from "@/types/payment";

export const PASS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASS_STORAGE_KEY = "printsheet_download_pass_v1";
const COUNTRY_CACHE_KEY = "printsheet_detected_country_v1";

/** All 27 European Union member states (ISO 3166-1 alpha-2). */
const EU_COUNTRY_CODES = new Set([
  "AT", // Austria
  "BE", // Belgium
  "BG", // Bulgaria
  "HR", // Croatia
  "CY", // Cyprus
  "CZ", // Czechia
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IE", // Ireland
  "IT", // Italy
  "LV", // Latvia
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "PL", // Poland
  "PT", // Portugal
  "RO", // Romania
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "SE", // Sweden
]);

const UK_TIMEZONES = new Set(["Europe/London", "Europe/Belfast", "GB", "GB-Eire"]);

const EU_TIMEZONES = new Set([
  "Europe/Amsterdam",
  "Europe/Athens",
  "Europe/Berlin",
  "Europe/Bratislava",
  "Europe/Brussels",
  "Europe/Bucharest",
  "Europe/Budapest",
  "Europe/Busingen",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Lisbon",
  "Europe/Ljubljana",
  "Europe/Luxembourg",
  "Europe/Madrid",
  "Europe/Malta",
  "Europe/Nicosia",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Riga",
  "Europe/Rome",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Tallinn",
  "Europe/Vienna",
  "Europe/Vilnius",
  "Europe/Warsaw",
  "Europe/Zagreb",
  "Asia/Nicosia",
  "Atlantic/Azores",
  "Atlantic/Canary",
  "Atlantic/Madeira",
]);

const US_TIMEZONES = new Set([
  "America/New_York",
  "America/Detroit",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/Indiana/Indianapolis",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Vevay",
  "America/Chicago",
  "America/Indiana/Tell_City",
  "America/Indiana/Knox",
  "America/Menominee",
  "America/North_Dakota/Center",
  "America/North_Dakota/New_Salem",
  "America/North_Dakota/Beulah",
  "America/Denver",
  "America/Boise",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Juneau",
  "America/Sitka",
  "America/Metlakatla",
  "America/Yakutat",
  "America/Nome",
  "America/Adak",
  "Pacific/Honolulu",
  "US/Eastern",
  "US/Central",
  "US/Mountain",
  "US/Pacific",
  "US/Alaska",
  "US/Hawaii",
]);

export const PRICING_BY_REGION = {
  US: {
    region: "US",
    countryCode: "US",
    regionLabel: "United States",
    currency: "USD",
    amount: 99,
    priceLabel: "$3.99",
  },
  UK: {
    region: "UK",
    countryCode: "GB",
    regionLabel: "United Kingdom",
    currency: "GBP",
    amount: 299,
    priceLabel: "£2.99",
  },
  EU: {
    region: "EU",
    countryCode: "EU",
    regionLabel: "European Union",
    currency: "EUR",
    amount: 299,
    priceLabel: "€2.99",
  },
  INTL: {
    region: "INTL",
    countryCode: "INTL",
    regionLabel: "International",
    currency: "USD",
    amount: 399,
    priceLabel: "$3.99",
  },
} as const satisfies Record<string, RegionPricing>;

export const DEFAULT_PRICING: RegionPricing = PRICING_BY_REGION.INTL;

export function pricingForCountry(countryCode: string | null | undefined): RegionPricing {
  const code = (countryCode || "").trim().toUpperCase();
  if (code === "US") return PRICING_BY_REGION.US;
  if (code === "GB" || code === "UK") return PRICING_BY_REGION.UK;
  if (EU_COUNTRY_CODES.has(code)) {
    return {
      ...PRICING_BY_REGION.EU,
      countryCode: code,
    };
  }
  return {
    ...PRICING_BY_REGION.INTL,
    countryCode: code || "INTL",
  };
}

/** Fast, offline-safe country detection from browser timezone and locale. */
export function detectPricingFromBrowser(): RegionPricing {
  if (typeof window === "undefined") return DEFAULT_PRICING;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (UK_TIMEZONES.has(tz)) return PRICING_BY_REGION.UK;
      if (EU_TIMEZONES.has(tz)) return PRICING_BY_REGION.EU;
      if (US_TIMEZONES.has(tz)) return PRICING_BY_REGION.US;
    }
  } catch {
    // Ignore Intl errors in restricted environments
  }

  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const lang of langs) {
      if (!lang) continue;
      const parts = lang.replace("_", "-").split("-");
      const regionSubtag = parts.length >= 2 ? parts[parts.length - 1].toUpperCase() : "";
      if (regionSubtag === "GB" || regionSubtag === "UK") return PRICING_BY_REGION.UK;
      if (regionSubtag === "US") return PRICING_BY_REGION.US;
      if (EU_COUNTRY_CODES.has(regionSubtag)) return pricingForCountry(regionSubtag);
    }
  } catch {
    // Ignore navigator errors
  }

  return DEFAULT_PRICING;
}

let inflightCountryPromise: Promise<RegionPricing> | null = null;

/**
 * Resolves the visitor's country pricing using a cached lightweight geo-IP lookup,
 * gracefully falling back to browser timezone/locale detection if offline or blocked.
 */
export function detectCountryPricingAsync(): Promise<RegionPricing> {
  if (typeof window === "undefined") return Promise.resolve(DEFAULT_PRICING);

  try {
    const cached = window.sessionStorage.getItem(COUNTRY_CACHE_KEY);
    if (cached) {
      return Promise.resolve(pricingForCountry(cached));
    }
  } catch {
    // Ignore storage access failures
  }

  if (inflightCountryPromise) return inflightCountryPromise;

  inflightCountryPromise = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1600);
    try {
      const res = await fetch("https://api.country.is/", {
        signal: controller.signal,
        cache: "force-cache",
      });
      if (res.ok) {
        const data = (await res.json()) as { country?: string };
        const code = typeof data?.country === "string" ? data.country.trim().toUpperCase() : "";
        if (/^[A-Z]{2}$/.test(code)) {
          try {
            window.sessionStorage.setItem(COUNTRY_CACHE_KEY, code);
          } catch {
            // ignore
          }
          return pricingForCountry(code);
        }
      }
    } catch {
      // Blocked by ad-blocker, CORS, timeout, or offline — use browser heuristic
    } finally {
      window.clearTimeout(timeout);
    }
    return detectPricingFromBrowser();
  })();

  return inflightCountryPromise;
}

function parsePaidPass(raw: string | null): PaidPass | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PaidPass>;
    if (
      typeof parsed?.orderID === "string" &&
      parsed.orderID.trim().length > 0 &&
      typeof parsed.expiresAt === "number" &&
      parsed.expiresAt > Date.now()
    ) {
      return {
        orderID: parsed.orderID,
        payerID: parsed.payerID,
        name: parsed.name,
        email: parsed.email,
        paidAt: typeof parsed.paidAt === "number" ? parsed.paidAt : Date.now(),
        expiresAt: parsed.expiresAt,
        currency: parsed.currency === "GBP" || parsed.currency === "EUR" ? parsed.currency : "USD",
        amount: typeof parsed.amount === "number" ? parsed.amount : 399,
        priceLabel: typeof parsed.priceLabel === "string" ? parsed.priceLabel : "$3.99",
      };
    }
  } catch {
    // Ignore corrupted storage
  }
  return null;
}

export function readPaidPass(): PaidPass | null {
  if (typeof window === "undefined") return null;

  try {
    const fromSession = parsePaidPass(window.sessionStorage.getItem(PASS_STORAGE_KEY));
    if (fromSession) return fromSession;
  } catch {
    // ignore
  }

  try {
    const fromLocal = parsePaidPass(window.localStorage.getItem(PASS_STORAGE_KEY));
    if (fromLocal) {
      try {
        window.sessionStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(fromLocal));
      } catch {
        // ignore
      }
      return fromLocal;
    }
  } catch {
    // ignore
  }

  return null;
}

export function savePaidPass(payment: PaymentState, pricing: RegionPricing): PaidPass {
  const now = Date.now();
  const pass: PaidPass = {
    orderID: payment.orderID,
    payerID: payment.payerID,
    name: payment.name,
    email: payment.email,
    paidAt: now,
    expiresAt: now + PASS_DURATION_MS,
    currency: pricing.currency,
    amount: pricing.amount,
    priceLabel: pricing.priceLabel,
  };

  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(pass);
    try {
      window.sessionStorage.setItem(PASS_STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
    try {
      window.localStorage.setItem(PASS_STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
  }

  return pass;
}

export function formatPassTimeLeft(expiresAt: number): string {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const totalMinutes = Math.ceil(remainingMs / 60000);
  if (totalMinutes <= 1) return "less than 1 min left";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours <= 0) return `${mins}m left`;
  if (mins === 0) return `${hours}h left`;
  return `${hours}h ${mins}m left`;
}

export { PASS_STORAGE_KEY };
