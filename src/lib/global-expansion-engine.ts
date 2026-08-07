import { ALL_300_ACHIEVEMENTS } from "./gamification";

export interface RegionMarketData {
  regionId: string;
  regionName: string;
  muslimPopulation: string; // e.g., "600M+"
  targetLanguages: string[];
  keyCountries: string[];
  competitionLevel: "High" | "Moderate" | "Low";
  growthOpportunity: string;
  pppDiscountPct: number; // Percentage discount relative to US base price
  primaryMadhabs: string[];
}

export interface LocalizationLanguageTier {
  code: string;
  name: string;
  nativeName: string;
  speakersCount: string;
  priorityPhase: "Phase 1 (W1-12)" | "Phase 2 (W13-26)" | "Phase 3 (M7-12)";
  rtl: boolean;
  completionPct: number;
}

export interface RegionalPricingTier {
  regionCode: string;
  regionName: string;
  currencyCode: string;
  currencySymbol: string;
  monthlyBasePriceUsd: number;
  monthlyLocalPriceFormatted: string;
  annualLocalPriceFormatted: string;
  familyPlanLocalFormatted: string;
  pppFactor: number;
}

export interface ComplianceItem {
  id: string;
  region: string;
  regulation: string; // e.g. "GDPR (EU)", "PIPL (China)", "Indonesian Data Sovereignty"
  category:
    "Privacy" | "Religious Content Policy" | "Financial/Islamic Licensing" | "Data Residency";
  status: "Compliant" | "In Review" | "Planned";
  requirements: string[];
}

export interface GtmMilestone {
  phase: string;
  timeframe: string;
  title: string;
  targetMarkets: string[];
  budgetUsd: number;
  keyDeliverables: string[];
  targetUserGrowth: string;
}

export const REGIONAL_MARKET_ANALYSIS: RegionMarketData[] = [
  {
    regionId: "mena",
    regionName: "Middle East & North Africa (MENA)",
    muslimPopulation: "400M+",
    targetLanguages: ["MSA Arabic", "Egyptian Arabic", "Hebrew", "French"],
    keyCountries: ["Egypt", "Saudi Arabia", "UAE", "Morocco", "Tunisia", "Jordan"],
    competitionLevel: "High",
    growthOpportunity: "Serving multilingual diaspora & Hebrew-literate Arabic speakers.",
    pppDiscountPct: 30,
    primaryMadhabs: ["Ash'ari / Shafi'i", "Hanbali", "Maliki"],
  },
  {
    regionId: "south_asia",
    regionName: "South Asia",
    muslimPopulation: "600M+",
    targetLanguages: ["Urdu", "Bengali", "Hindi"],
    keyCountries: ["Pakistan", "Bangladesh", "India"],
    competitionLevel: "Moderate",
    growthOpportunity: "High-density mobile-first audience seeking interactive AI & Tajweed.",
    pppDiscountPct: 60,
    primaryMadhabs: ["Hanafi"],
  },
  {
    regionId: "sea",
    regionName: "Southeast Asia (ASEAN)",
    muslimPopulation: "250M+",
    targetLanguages: ["Indonesian (Bahasa)", "Malay"],
    keyCountries: ["Indonesia", "Malaysia", "Brunei", "Singapore"],
    competitionLevel: "Moderate",
    growthOpportunity: "Rapidly expanding tech adoption, active social learning circles.",
    pppDiscountPct: 50,
    primaryMadhabs: ["Shafi'i"],
  },
  {
    regionId: "europe",
    regionName: "Europe",
    muslimPopulation: "30M+",
    targetLanguages: ["French", "German", "English", "Turkish"],
    keyCountries: ["France", "UK", "Germany", "Netherlands"],
    competitionLevel: "High",
    growthOpportunity: "Second-generation diaspora seeking clean, modern digital tools.",
    pppDiscountPct: 0,
    primaryMadhabs: ["Hanafi", "Maliki", "Shafi'i"],
  },
  {
    regionId: "north_america",
    regionName: "North America",
    muslimPopulation: "10M+",
    targetLanguages: ["English", "Arabic", "Urdu"],
    keyCountries: ["USA", "Canada"],
    competitionLevel: "High",
    growthOpportunity: "High ARPU, strong institutional and Islamic school subscription potential.",
    pppDiscountPct: 0,
    primaryMadhabs: ["Pluralistic / All Schools"],
  },
];

export const LANGUAGE_LOCALIZATION_PRIORITIES: LocalizationLanguageTier[] = [
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    speakersCount: "170M",
    priorityPhase: "Phase 1 (W1-12)",
    rtl: true,
    completionPct: 100,
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    speakersCount: "230M",
    priorityPhase: "Phase 1 (W1-12)",
    rtl: false,
    completionPct: 100,
  },
  {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    speakersCount: "75M",
    priorityPhase: "Phase 2 (W13-26)",
    rtl: false,
    completionPct: 85,
  },
  {
    code: "fa",
    name: "Farsi / Persian",
    nativeName: "فارسی",
    speakersCount: "70M",
    priorityPhase: "Phase 2 (W13-26)",
    rtl: true,
    completionPct: 80,
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    speakersCount: "85M",
    priorityPhase: "Phase 2 (W13-26)",
    rtl: false,
    completionPct: 75,
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    speakersCount: "80M",
    priorityPhase: "Phase 3 (M7-12)",
    rtl: false,
    completionPct: 60,
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    speakersCount: "25M",
    priorityPhase: "Phase 3 (M7-12)",
    rtl: false,
    completionPct: 55,
  },
];

export const REGIONAL_PRICING_TIERS: RegionalPricingTier[] = [
  {
    regionCode: "US",
    regionName: "United States & Canada",
    currencyCode: "USD",
    currencySymbol: "$",
    monthlyBasePriceUsd: 4.99,
    monthlyLocalPriceFormatted: "$4.99 / mo",
    annualLocalPriceFormatted: "$49.99 / yr",
    familyPlanLocalFormatted: "$99.99 / yr (5 accounts)",
    pppFactor: 1.0,
  },
  {
    regionCode: "IN_PK",
    regionName: "South Asia (India / Pakistan / BD)",
    currencyCode: "INR / PKR",
    currencySymbol: "₹ / ₨",
    monthlyBasePriceUsd: 1.99,
    monthlyLocalPriceFormatted: "₹169 / mo (₨550)",
    annualLocalPriceFormatted: "₹1,690 / yr",
    familyPlanLocalFormatted: "₹3,290 / yr",
    pppFactor: 0.4,
  },
  {
    regionCode: "ID_MY",
    regionName: "Southeast Asia (Indonesia / Malaysia)",
    currencyCode: "IDR / MYR",
    currencySymbol: "Rp / RM",
    monthlyBasePriceUsd: 2.49,
    monthlyLocalPriceFormatted: "Rp 39.000 / mo (RM 11.90)",
    annualLocalPriceFormatted: "Rp 390.000 / yr",
    familyPlanLocalFormatted: "Rp 750.000 / yr",
    pppFactor: 0.5,
  },
  {
    regionCode: "EG_SA",
    regionName: "MENA (Egypt / Saudi Arabia / UAE)",
    currencyCode: "EGP / SAR / AED",
    currencySymbol: "EGP / SAR",
    monthlyBasePriceUsd: 3.49,
    monthlyLocalPriceFormatted: "SAR 12.99 / mo (120 EGP)",
    annualLocalPriceFormatted: "SAR 129.99 / yr",
    familyPlanLocalFormatted: "SAR 249.99 / yr",
    pppFactor: 0.7,
  },
  {
    regionCode: "EU",
    regionName: "Europe (UK / EU)",
    currencyCode: "EUR / GBP",
    currencySymbol: "€ / £",
    monthlyBasePriceUsd: 4.99,
    monthlyLocalPriceFormatted: "€4.99 / mo (£4.29)",
    annualLocalPriceFormatted: "€49.99 / yr",
    familyPlanLocalFormatted: "€99.99 / yr",
    pppFactor: 1.0,
  },
];

export const GTM_PHASE_MILESTONES: GtmMilestone[] = [
  {
    phase: "Phase 1: High Impact Emerging Asia",
    timeframe: "Weeks 1 - 12",
    title: "Urdu & Indonesian Regional Rollout",
    targetMarkets: ["Pakistan", "India", "Indonesia"],
    budgetUsd: 120000,
    keyDeliverables: [
      "Native Urdu & Bahasa Indonesia UI localization",
      "Hanafi & Shafi'i specific Tafsir tagging",
      "Partnerships with top 10 Islamic EdTech influencers",
      "Local payment gateway integration (GoPay, DANA, JazzCash)",
    ],
    targetUserGrowth: "250,000 Active Users",
  },
  {
    phase: "Phase 2: Expanded Regional Expansion",
    timeframe: "Weeks 13 - 26",
    title: "Malay, Farsi & Turkish Language Hubs",
    targetMarkets: ["Malaysia", "Iran/Iraq", "Turkey", "Central Asia"],
    budgetUsd: 180000,
    keyDeliverables: [
      "Farsi & Turkish RTL/LTR fine-tuning",
      "Ja'fari and Hanafi scholarly commentary modules",
      "App Store & Google Play Regional ASO Optimization",
      "School & Madrasa institutional pilot licenses",
    ],
    targetUserGrowth: "750,000 Active Users",
  },
  {
    phase: "Phase 3: Global Diaspora & Enterprise SaaS",
    timeframe: "Months 7 - 12",
    title: "European Languages & Institutional Licensing",
    targetMarkets: ["France", "Germany", "UK", "USA/Canada"],
    budgetUsd: 250000,
    keyDeliverables: [
      "French & German localized curricula",
      "GDPR and regional data residency compliance verification",
      "Institutional SSO & Classroom LMS integration",
      "24/7 multilingual AI support chat",
    ],
    targetUserGrowth: "2,500,000 Active Users",
  },
];

export const COMPLIANCE_REGULATORY_CHECKLIST: ComplianceItem[] = [
  {
    id: "comp_gdpr",
    region: "European Union & UK",
    regulation: "GDPR & Data Protection Act 2018",
    category: "Privacy",
    status: "Compliant",
    requirements: [
      "Explicit consent for analytics & cookies",
      "Right to be forgotten (data deletion tool)",
      "Zero PII exposure in server logs",
    ],
  },
  {
    id: "comp_data_residency",
    region: "Kingdom of Saudi Arabia & UAE",
    regulation: "SDAIA / NDMO Data Sovereignty",
    category: "Data Residency",
    status: "Compliant",
    requirements: [
      "Cloud hosting in Middle East GCP Cloud Run regions (me-central1)",
      "Encrypted local backup storage",
    ],
  },
  {
    id: "comp_content_sensitivities",
    region: "Global Islamic Advisory Board",
    regulation: "Fiqh & Scholarly Review Guidelines",
    category: "Religious Content Policy",
    status: "Compliant",
    requirements: [
      "Clear attribution of Tafsir sources (Ibn Kathir, Al-Jalalayn, Al-Mizan)",
      "Balanced presentation across Hanafi, Maliki, Shafi'i, Hanbali, Ja'fari, and Ibadi schools",
    ],
  },
];

export class GlobalExpansionEngine {
  public static calculatePPPPrice(basePriceUsd: number, pppDiscountPct: number): number {
    const discounted = basePriceUsd * (1 - pppDiscountPct / 100);
    return Math.max(0.99, Math.round(discounted * 100) / 100);
  }

  public static exportExpansionStrategySummary(): string {
    const report = {
      title: "Bayan Global Expansion & Localization Strategy",
      generatedAt: new Date().toISOString(),
      totalTargetMarketSize: "1.3 Billion Muslims",
      phasesCount: GTM_PHASE_MILESTONES.length,
      totalBudgetUsd: GTM_PHASE_MILESTONES.reduce((sum, m) => sum + m.budgetUsd, 0),
      languagesCount: LANGUAGE_LOCALIZATION_PRIORITIES.length,
    };

    return JSON.stringify(report, null, 2);
  }
}
