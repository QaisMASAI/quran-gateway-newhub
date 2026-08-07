import React, { useState } from "react";
import {
  Globe2,
  Languages,
  DollarSign,
  Scale,
  Calendar,
  ShieldCheck,
  Building,
  TrendingUp,
  Download,
  CheckCircle2,
  Layers,
  Sparkles,
  Users,
  Compass,
  BookOpen,
  Sliders,
  ExternalLink,
  ChevronRight,
  Calculator,
} from "lucide-react";
import {
  GlobalExpansionEngine,
  REGIONAL_MARKET_ANALYSIS,
  LANGUAGE_LOCALIZATION_PRIORITIES,
  REGIONAL_PRICING_TIERS,
  GTM_PHASE_MILESTONES,
  COMPLIANCE_REGULATORY_CHECKLIST,
} from "@/lib/global-expansion-engine";

interface GlobalExpansionDashboardProps {
  locale?: "en" | "ar" | "he";
}

export const GlobalExpansionDashboard: React.FC<GlobalExpansionDashboardProps> = ({
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<
    "markets" | "languages" | "madhabs" | "pricing" | "gtm" | "compliance"
  >("markets");

  // PPP Interactive Calculator State
  const [baseUsdPrice, setBaseUsdPrice] = useState(4.99);
  const [customPppDiscount, setCustomPppDiscount] = useState(40);

  // Selected Region Filter
  const [selectedRegionId, setSelectedRegionId] = useState<string>("all");

  const calculatedPppPrice = GlobalExpansionEngine.calculatePPPPrice(
    baseUsdPrice,
    customPppDiscount,
  );

  const handleExportStrategyReport = () => {
    const dataStr = GlobalExpansionEngine.exportExpansionStrategySummary();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Bayan_Global_Expansion_Strategy.json";
    a.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4 px-2 sm:px-4">
      {/* HEADER: GLOBAL EXPANSION STRATEGY BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider dir-auto">
                {isAr
                  ? "إستراتيجية التوسع العالمي والتعريب"
                  : "Global Expansion & Localization Strategy • 100M+ Learners Reach"}
              </div>
              <h1 className="text-xl font-black tracking-tight dir-auto">
                Bayan Quran Gateway Global Roadmap
              </h1>
            </div>
          </div>

          <button
            onClick={handleExportStrategyReport}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500 text-zinc-950 font-black text-xs hover:bg-blue-400 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive Strategy PDF/JSON</span>
          </button>
        </div>

        {/* Global Strategy High-Level Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-blue-300 font-bold">Target Market Population</div>
            <div className="text-xl font-black font-mono">1.3 Billion Muslims</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-blue-300 font-bold">Phase 1-3 Languages</div>
            <div className="text-xl font-black font-mono">7 Key Languages</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-blue-300 font-bold">GTM Year 1 Budget</div>
            <div className="text-xl font-black font-mono">$550,000 USD</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-blue-300 font-bold">Target Year 1 Users</div>
            <div className="text-xl font-black font-mono">2.5M Active</div>
          </div>
        </div>
      </div>

      {/* STRATEGY NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
        {[
          {
            id: "markets",
            label: isAr ? "تحليل الأسواق الإقليمية" : "Regional Market Analysis",
            icon: Compass,
          },
          {
            id: "languages",
            label: isAr ? "إستراتيجية التعريب واللغات" : "Language & Localization Roadmap",
            icon: Languages,
          },
          {
            id: "madhabs",
            label: isAr ? "المدارس الفقهية المعتمدة" : "Islamic School Neutrality (Madhabs)",
            icon: Scale,
          },
          {
            id: "pricing",
            label: isAr ? "التسعير الإقليمي القائم على PPP" : "Regional Pricing & PPP Calculator",
            icon: Calculator,
          },
          {
            id: "gtm",
            label: isAr ? "خطة الدخول والجدول الزمني" : "Market Entry Timeline (GTM)",
            icon: Calendar,
          },
          {
            id: "compliance",
            label: isAr ? "الامتثال والتنظيم" : "Regulatory & Compliance Checklist",
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-500 shadow-md"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGIONAL MARKET ANALYSIS */}
      {activeTab === "markets" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REGIONAL_MARKET_ANALYSIS.map((m) => (
              <div
                key={m.regionId}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 flex flex-col justify-between hover:border-blue-500/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-mono font-bold uppercase">
                      {m.muslimPopulation}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        m.competitionLevel === "High"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      Competition: {m.competitionLevel}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                    {m.regionName}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
                    {m.growthOpportunity}
                  </p>

                  <div className="space-y-1 pt-2 text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
                    <div>
                      <span className="font-bold text-blue-600">Key Countries: </span>
                      {m.keyCountries.join(", ")}
                    </div>
                    <div>
                      <span className="font-bold text-indigo-600">Primary Languages: </span>
                      {m.targetLanguages.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono">PPP Discount: {m.pppDiscountPct}%</span>
                  <span className="font-bold text-blue-600">
                    Madhab: {m.primaryMadhabs.join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LANGUAGE & LOCALIZATION ROADMAP */}
      {activeTab === "languages" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
                <Languages className="w-5 h-5 text-blue-500" />
                {isAr
                  ? "مصفوفة أولويات التعريب والترجمة"
                  : "Language Prioritization & Localization Matrix"}
              </h3>
              <span className="text-xs font-mono text-zinc-400">7 Core Target Languages</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-mono uppercase">
                    <th className="py-3 px-2">Language</th>
                    <th className="py-3 px-2">Native Name</th>
                    <th className="py-3 px-2">Speakers</th>
                    <th className="py-3 px-2">Phase</th>
                    <th className="py-3 px-2">Text Direction</th>
                    <th className="py-3 px-2">Engine Readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {LANGUAGE_LOCALIZATION_PRIORITIES.map((lang) => (
                    <tr key={lang.code} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-2 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 font-mono text-[10px] flex items-center justify-center font-bold">
                          {lang.code.toUpperCase()}
                        </span>
                        <span>{lang.name}</span>
                      </td>
                      <td className="py-3 px-2 font-serif text-amber-600 dark:text-amber-400">
                        {lang.nativeName}
                      </td>
                      <td className="py-3 px-2 font-mono">{lang.speakersCount}</td>
                      <td className="py-3 px-2 font-bold text-indigo-600 dark:text-indigo-400">
                        {lang.priorityPhase}
                      </td>
                      <td className="py-3 px-2 font-mono">
                        {lang.rtl ? "RTL (Right-to-Left)" : "LTR (Left-to-Right)"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${lang.completionPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-emerald-600">
                            {lang.completionPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ISLAMIC SCHOOL NEUTRALITY (MADHABS) */}
      {activeTab === "madhabs" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
              <Scale className="w-5 h-5 text-amber-500" />
              {isAr
                ? "إطار تمثيل المدارس الفقهية المتعددة"
                : "Pluralistic School Representation Framework"}
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              Scholar-Neutral Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              {
                school: "Hanafi School",
                region: "South Asia, Turkey, Central Asia",
                tafsirSources: ["Tafsir al-Kashshaf", "Tafsir Ibn Kathir"],
                keyFeature: "Primary focus for 500M+ users in Pakistan, India, Turkey.",
              },
              {
                school: "Shafi'i School",
                region: "Southeast Asia (Indonesia, Malaysia), East Africa",
                tafsirSources: ["Tafsir al-Jalalayn", "Tafsir Al-Azhar (Hamka)"],
                keyFeature: "Tailored commentaries for Bahasa Indonesia and Malay learners.",
              },
              {
                school: "Maliki School",
                region: "North Africa, West Africa",
                tafsirSources: ["Tafsir al-Qurtubi", "Ahkam al-Quran"],
                keyFeature: "Integrates Andalusian and North African scholarly traditions.",
              },
              {
                school: "Hanbali School",
                region: "Saudi Arabia, Arabian Gulf",
                tafsirSources: ["Tafsir Al-Sa'di", "Tafsir Ibn Kathir"],
                keyFeature: "Clear literal and textual clarity for traditional study.",
              },
              {
                school: "Ja'fari (Shia) School",
                region: "Iran, Iraq, Lebanon, Diaspora",
                tafsirSources: ["Tafsir Al-Mizan (Allamah Tabataba'i)"],
                keyFeature: "Includes Shia scholarly perspectives for comparative study.",
              },
              {
                school: "Ibadi School",
                region: "Oman, North Africa pockets",
                tafsirSources: ["Tafsir Himyan al-Zad"],
                keyFeature: "Respectful representation of Omani scholarly traditions.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {item.school}
                </div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                  {item.region}
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{item.keyFeature}</p>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/50 text-[10px] font-mono text-zinc-400">
                  Ref: {item.tafsirSources.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REGIONAL PRICING & PPP CALCULATOR */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
              <Calculator className="w-5 h-5 text-emerald-500" />
              {isAr
                ? "حاسبة القدرة الشرائية والتسعير الإقليمي"
                : "Purchasing Power Parity (PPP) Pricing Engine"}
            </h3>

            {/* Interactive PPP Adjuster */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    Interactive PPP Price Calculator
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Simulate regional pricing discounts based on Local Purchasing Power.
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <div>
                    Base Price (US): <span className="text-emerald-600">${baseUsdPrice}</span>
                  </div>
                  <div>
                    PPP Discount: <span className="text-emerald-600">{customPppDiscount}%</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-black">
                    Local Monthly: ${calculatedPppPrice} USD
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-zinc-500">Discount %:</span>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={customPppDiscount}
                  onChange={(e) => setCustomPppDiscount(Number(e.target.value))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Regional Pricing Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REGIONAL_PRICING_TIERS.map((tier) => (
                <div
                  key={tier.regionCode}
                  className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                      {tier.currencyCode}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      PPP Factor: {tier.pppFactor}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {tier.regionName}
                  </h4>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                      <span>Monthly:</span>
                      <span className="font-bold">{tier.monthlyLocalPriceFormatted}</span>
                    </div>
                    <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                      <span>Annual Tier:</span>
                      <span className="font-bold">{tier.annualLocalPriceFormatted}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-[11px]">
                      <span>Family Plan:</span>
                      <span>{tier.familyPlanLocalFormatted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GTM TIMELINE */}
      {activeTab === "gtm" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Calendar className="w-5 h-5 text-indigo-500" />
            {isAr
              ? "الجدول الزمني ومراحل الدخول للأسواق"
              : "3-Phase Go-To-Market Execution Timeline"}
          </h3>

          <div className="space-y-4">
            {GTM_PHASE_MILESTONES.map((phase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-700/50 pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {phase.timeframe}
                    </span>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                      {phase.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold">
                      Budget: ${phase.budgetUsd.toLocaleString()} USD
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                      Target: {phase.targetUserGrowth}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {phase.keyDeliverables.map((del, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COMPLIANCE CHECKLIST */}
      {activeTab === "compliance" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            {isAr
              ? "قائمة الخصوصية والامتثال اللائحي"
              : "Regulatory Compliance & Data Residency Audit"}
          </h3>

          <div className="space-y-3">
            {COMPLIANCE_REGULATORY_CHECKLIST.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                    {comp.regulation} ({comp.region})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {comp.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {comp.requirements.map((req, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
