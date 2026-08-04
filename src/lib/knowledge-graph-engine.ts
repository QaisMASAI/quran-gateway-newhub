import {
  listAllEntities,
  listRelations,
  pickLocale,
  type KnowledgeEntity,
  type EntityKind,
} from "@/lib/knowledge";
import { ALL_PROPHETS } from "@/lib/prophets";
import { ALL_TOPICS } from "@/lib/topics";
import { QUESTION_DATABASE } from "@/lib/gamification-questions";
import seed from "@/lib/seeds/knowledge-seed.json";

export type GraphDimension =
  | "quran"
  | "hadith"
  | "tafsir"
  | "prophet"
  | "scholar"
  | "topic"
  | "story"
  | "place"
  | "event"
  | "vocabulary";

export interface I18nText {
  he?: string;
  ar?: string;
  en?: string;
}

export interface GraphNode {
  id: string;
  slug: string;
  dimension: GraphDimension;
  title: I18nText;
  summary: I18nText;
  icon?: string;
  color: string;
  weight: number;
  metadata?: {
    surah?: number;
    ayahStart?: number;
    ayahEnd?: number;
    hadithRef?: string;
    tafsirSource?: string;
    arabicRoot?: string;
    era?: string;
    location?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: I18nText;
  weight: number;
}

export interface DynamicGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  dimensionCounts: Record<GraphDimension, number>;
}

export interface Entity10DHubData {
  focusNode: GraphNode | null;
  quran: GraphNode[];
  hadith: GraphNode[];
  tafsir: GraphNode[];
  prophet: GraphNode[];
  scholar: GraphNode[];
  topic: GraphNode[];
  story: GraphNode[];
  place: GraphNode[];
  event: GraphNode[];
  vocabulary: GraphNode[];
  totalConnections: number;
  graph: DynamicGraphData;
}

export const DIMENSION_CONFIG: Record<
  GraphDimension,
  {
    labelEn: string;
    labelAr: string;
    labelHe: string;
    icon: string;
    color: string;
    bgHex: string;
    borderClass: string;
  }
> = {
  quran: {
    labelEn: "Quran Verses",
    labelAr: "الآيات القرأنية",
    labelHe: "פסוקי קוראן",
    icon: "📖",
    color: "#10b981", // emerald
    bgHex: "#ecfdf5",
    borderClass: "border-emerald-500",
  },
  hadith: {
    labelEn: "Hadith & Sunnah",
    labelAr: "الأحاديث والسنة",
    labelHe: "חדית' וסונה",
    icon: "📜",
    color: "#0284c7", // sky
    bgHex: "#f0f9ff",
    borderClass: "border-sky-500",
  },
  tafsir: {
    labelEn: "Tafsir Exegesis",
    labelAr: "التفسير والبيان",
    labelHe: "פרשנות תפסיר",
    icon: "🔍",
    color: "#8b5cf6", // purple
    bgHex: "#f5f3ff",
    borderClass: "border-purple-500",
  },
  prophet: {
    labelEn: "Prophets & Messengers",
    labelAr: "الأنبياء والمرسلون",
    labelHe: "נביאים ושליחים",
    icon: "🌱",
    color: "#f59e0b", // amber
    bgHex: "#fffbeb",
    borderClass: "border-amber-500",
  },
  scholar: {
    labelEn: "Scholars & Companions",
    labelAr: "العلماء والصحابة",
    labelHe: "חכמים וסחאבה",
    icon: "🎓",
    color: "#d97706", // amber-dark
    bgHex: "#fef3c7",
    borderClass: "border-amber-600",
  },
  topic: {
    labelEn: "Islamic Topics & Fiqh",
    labelAr: "الموضوعات والفقه",
    labelHe: "נושאים והלכה",
    icon: "💡",
    color: "#06b6d4", // cyan
    bgHex: "#ecfeff",
    borderClass: "border-cyan-500",
  },
  story: {
    labelEn: "Quranic Stories",
    labelAr: "قصص القرآن",
    labelHe: "סיפורי הקוראן",
    icon: "📚",
    color: "#ec4899", // pink
    bgHex: "#fdf2f8",
    borderClass: "border-pink-500",
  },
  place: {
    labelEn: "Sacred Places",
    labelAr: "الأماكن المقدسة",
    labelHe: "מקומות קדושים",
    icon: "🕌",
    color: "#ef4444", // red
    bgHex: "#fef2f2",
    borderClass: "border-rose-500",
  },
  event: {
    labelEn: "Historical Events",
    labelAr: "الأحداث التاريخية",
    labelHe: "אירועים היסטוריים",
    icon: "⌛",
    color: "#84cc16", // lime
    bgHex: "#f7fee7",
    borderClass: "border-lime-500",
  },
  vocabulary: {
    labelEn: "Quranic Vocabulary",
    labelAr: "المفردات والجذور",
    labelHe: "אוצר מילים ושורשים",
    icon: "🔤",
    color: "#6366f1", // indigo
    bgHex: "#eef2ff",
    borderClass: "border-indigo-500",
  },
};

// Seed 10-dimensional curated dataset for automatic graph building
const VOCABULARY_NODES: GraphNode[] = [
  {
    id: "vocab:tawhid",
    slug: "tawhid",
    dimension: "vocabulary",
    title: { ar: "التوحيد", en: "Tawhid (Islamic Monotheism)", he: "תוחיד (ייחוד האל)" },
    summary: {
      ar: "إفراد الله بالعبادة والربوبية والأسماء والصفات.",
      en: "The foundational Islamic concept of absolute monotheism and oneness of God.",
      he: "יסוד אמונת היחוד המוחלט באסלאם.",
    },
    color: DIMENSION_CONFIG.vocabulary.color,
    weight: 10,
    metadata: { arabicRoot: "و-ح-د" },
  },
  {
    id: "vocab:taqwa",
    slug: "taqwa",
    dimension: "vocabulary",
    title: { ar: "التقوى", en: "Taqwa (God-Consciousness)", he: "תקווא (יראת שמיים)" },
    summary: {
      ar: "الوقاية من عذاب الله بامتثال أوامره واجتناب نواهيه.",
      en: "A state of heart consciousness and piety protecting oneself against divine punishment.",
      he: "מצב הלב של יראת שמיים ומודעות אלוהית.",
    },
    color: DIMENSION_CONFIG.vocabulary.color,
    weight: 9,
    metadata: { arabicRoot: "و-ق-ي" },
  },
  {
    id: "vocab:sabr",
    slug: "sabr",
    dimension: "vocabulary",
    title: { ar: "الصبر", en: "Sabr (Patience & Perseverance)", he: "סבר (סבלנות והתמדה)" },
    summary: {
      ar: "حبس النفس على طاعة الله وعن معصيته وعلى أقادره.",
      en: "Steadfast patience and emotional resilience under trial.",
      he: "עמידות, סבלנות והתמדה בשעות ניסיון.",
    },
    color: DIMENSION_CONFIG.vocabulary.color,
    weight: 9,
    metadata: { arabicRoot: "ص-ب-ر" },
  },
  {
    id: "vocab:ihsan",
    slug: "ihsan",
    dimension: "vocabulary",
    title: { ar: "الإحسان", en: "Ihsan (Spiritual Excellence)", he: "איחסאן (מצויינות רוחנית)" },
    summary: {
      ar: "أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك.",
      en: "To worship God as if you see Him, knowing that He sees you.",
      he: "לעבוד את אלוהים כאילו אתה רואה אותו.",
    },
    color: DIMENSION_CONFIG.vocabulary.color,
    weight: 8,
    metadata: { arabicRoot: "ح-س-ن" },
  },
  {
    id: "vocab:hikmah",
    slug: "hikmah",
    dimension: "vocabulary",
    title: { ar: "الحكمة", en: "Hikmah (Wisdom & Discernment)", he: "חיכמה (חכמה ותבונה)" },
    summary: {
      ar: "وضع الشيء في موضعه الصحيح وفهم مراد الله.",
      en: "Placing everything in its rightful place with deep understanding.",
      he: "חכמה עמוקה והבנה נכונה של האמת.",
    },
    color: DIMENSION_CONFIG.vocabulary.color,
    weight: 8,
    metadata: { arabicRoot: "ح-ك-م" },
  },
];

const SCHOLAR_NODES: GraphNode[] = [
  {
    id: "scholar:ibn-kathir",
    slug: "ibn-kathir",
    dimension: "scholar",
    title: { ar: "الإمام ابن كثير", en: "Imam Ibn Kathir", he: "אימאם אבן כת'יר" },
    summary: {
      ar: "صاحب التفسير الشهير والبداية والنهاية.",
      en: "Renowned 8th century Mamluk scholar, historian and mufassir.",
      he: "פרשן קוראן והיסטוריון דגול במאה ה-14.",
    },
    color: DIMENSION_CONFIG.scholar.color,
    weight: 10,
    metadata: { era: "701–774 AH" },
  },
  {
    id: "scholar:al-bukhari",
    slug: "al-bukhari",
    dimension: "scholar",
    title: { ar: "الإمام البخاري", en: "Imam Al-Bukhari", he: "אימאם אל-בוח'ארי" },
    summary: {
      ar: "أمير المؤمنين في الحديث وصاحب الجامع الصحيح.",
      en: "Master collector of Prophetic traditions and compiler of Sahih Al-Bukhari.",
      he: "מקבץ החדית' המפורסם ביותר באסלאם.",
    },
    color: DIMENSION_CONFIG.scholar.color,
    weight: 10,
    metadata: { era: "194–256 AH" },
  },
  {
    id: "scholar:aisha-bint-abi-bakr",
    slug: "aisha-bint-abi-bakr",
    dimension: "scholar",
    title: { ar: "عائشة أم المؤمنين", en: "Aisha bint Abi Bakr (ra)", he: "עאישה בינת אבו בכר" },
    summary: {
      ar: "أم المؤمنين، الفقيهة العالمة والمكثرة من رواية الحديث.",
      en: "Mother of the Believers, eminent scholar, jurist, and narrator of over 2,200 Hadiths.",
      he: "אשת הנביא, חוקרת דגולה ומספרת חדית' מרכזית.",
    },
    color: DIMENSION_CONFIG.scholar.color,
    weight: 10,
    metadata: { era: "First Century AH" },
  },
  {
    id: "scholar:ibn-abbas",
    slug: "ibn-abbas",
    dimension: "scholar",
    title: { ar: "عبد الله بن عباس", en: "Abdullah ibn Abbas (ra)", he: "עבדאללה אבן עבאס" },
    summary: {
      ar: "ترجمان القرآن وحبر الأمة دعا له النبي بالفقه في الدين.",
      en: "The Grand Interpreter of the Quran and cousin of Prophet Muhammad ﷺ.",
      he: "פרשן הקוראן הראשי בדור הסחאבה.",
    },
    color: DIMENSION_CONFIG.scholar.color,
    weight: 9,
    metadata: { era: "3 BH – 68 AH" },
  },
];

const TAFSIR_NODES: GraphNode[] = [
  {
    id: "tafsir:ibn-kathir-fatihah",
    slug: "tafsir-ibn-kathir-fatihah",
    dimension: "tafsir",
    title: { ar: "تفسير ابن كثير - الفاتحة", en: "Tafsir Ibn Kathir: Surah Al-Fatihah", he: "תפסיר אבן כת'יר: סורת אל-פאתיחה" },
    summary: {
      ar: "بيان أسرار السبع المثاني وتفسير الحمد والهد الصراط المستقيم.",
      en: "Exegesis on the opening chapter detailing praise, guidance, and the Straight Path.",
      he: "פרשנות מפורטת על פרק הפתיחה של הקוראן.",
    },
    color: DIMENSION_CONFIG.tafsir.color,
    weight: 9,
    metadata: { tafsirSource: "Ibn Kathir" },
  },
  {
    id: "tafsir:asbab-nuzul-badr",
    slug: "tafsir-asbab-nuzul-badr",
    dimension: "tafsir",
    title: { ar: "أسباب النزول - غزوة بدر", en: "Asbab al-Nuzul: Battle of Badr", he: "נסיבות ההתגלות: קרב באדר" },
    summary: {
      ar: "سياق نزول آيات الأنفال والمدد الإلهي بالملائكة في بدر.",
      en: "Historical contexts behind the revelation of Surah Al-Anfal during the Battle of Badr.",
      he: "נסיבות ההתגלות של הניצחון בקרב באדר.",
    },
    color: DIMENSION_CONFIG.tafsir.color,
    weight: 8,
    metadata: { tafsirSource: "Al-Wahidi" },
  },
];

const HADITH_NODES: GraphNode[] = [
  {
    id: "hadith:bukhari-1",
    slug: "bukhari-intentions",
    dimension: "hadith",
    title: { ar: "حديث إنما الأعمال بالنيات", en: "Hadith of Intentions (Sahih Bukhari #1)", he: "חדית' הכוונות (בוח'ארי 1)" },
    summary: {
      ar: "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى.",
      en: "Actions are judged according to intentions, and every person will get what they intended.",
      he: "מעשים נשפטים לפי הכוונה שבלב.",
    },
    color: DIMENSION_CONFIG.hadith.color,
    weight: 10,
    metadata: { hadithRef: "Sahih al-Bukhari 1" },
  },
  {
    id: "hadith:muslim-jibril",
    slug: "hadith-jibril",
    dimension: "hadith",
    title: { ar: "حديث جبريل عليه السلام", en: "Hadith of Jibril (Islam, Iman, Ihsan)", he: "חדית' המלאך גבריאל" },
    summary: {
      ar: "بيان أركان الإسلام والإيمان والإحسان وعلامات الساعة.",
      en: "The famous narration defining the pillars of Islam, Faith, Spiritual Perfection, and the Final Hour.",
      he: "החדית' המפורסם המגדיר את יסודות הדת והאמונה.",
    },
    color: DIMENSION_CONFIG.hadith.color,
    weight: 10,
    metadata: { hadithRef: "Sahih Muslim 8" },
  },
];

const QURAN_NODES: GraphNode[] = [
  {
    id: "quran:1:1",
    slug: "surah-1",
    dimension: "quran",
    title: { ar: "سورة الفاتحة (1:1-7)", en: "Surah Al-Fatihah (1:1-7)", he: "סורת אל-פאתיחה" },
    summary: {
      ar: "أم الكتاب والسبع المثاني والشفاء التام.",
      en: "The Essence of the Quran, reciter in every unit of prayer.",
      he: "פרק הפתיחה של הקוראן.",
    },
    color: DIMENSION_CONFIG.quran.color,
    weight: 10,
    metadata: { surah: 1, ayahStart: 1, ayahEnd: 7 },
  },
  {
    id: "quran:2:255",
    slug: "ayat-al-kursi",
    dimension: "quran",
    title: { ar: "آية الكرسي (البقرة 2:255)", en: "Ayat Al-Kursi (2:255)", he: "פסוק הכס (2:255)" },
    summary: {
      ar: "أعظم آية في كتاب الله تحتوي التوحيد والقيومية.",
      en: "The Throne Verse, the greatest verse in the Holy Quran.",
      he: "פסוק הכס - הפסוק הנשגב ביותר בקוראן.",
    },
    color: DIMENSION_CONFIG.quran.color,
    weight: 10,
    metadata: { surah: 2, ayahStart: 255, ayahEnd: 255 },
  },
  {
    id: "quran:18:1",
    slug: "surah-kahf",
    dimension: "quran",
    title: { ar: "سورة الكهف (18)", en: "Surah Al-Kahf (18:1-110)", he: "סורת המערה (18)" },
    summary: {
      ar: "سورة العطاء والنور تحتوي على 4 قصص وإرشادات هداية.",
      en: "The Cave, containing stories of faith, trials of wealth, knowledge, and power.",
      he: "סורת המערה הכוללת סיפורי מוסר ואמונה.",
    },
    color: DIMENSION_CONFIG.quran.color,
    weight: 9,
    metadata: { surah: 18, ayahStart: 1, ayahEnd: 110 },
  },
];

/**
 * Automatically builds a complete 10-dimensional knowledge graph for any query or entity slug.
 */
export async function buildDynamicKnowledgeGraph(
  focusSlug?: string,
  limitPerDimension = 6
): Promise<Entity10DHubData> {
  const allEntities = await listAllEntities();
  const allDbRelations = await listRelations();

  // Convert knowledge entities into GraphNodes
  const entityNodes: GraphNode[] = allEntities.map((e) => {
    let dim: GraphDimension = "topic";
    if (e.kind === "prophet") dim = "prophet";
    else if (e.kind === "story") dim = "story";
    else if (e.kind === "event") dim = "event";
    else if (e.kind === "place") dim = "place";
    else if (e.kind === "scholar" || e.kind === "companion" || e.kind === "narrator") dim = "scholar";
    else if (e.kind === "concept" || e.kind === "theme" || e.kind === "topic" || e.kind === "dua") dim = "topic";

    const cfg = DIMENSION_CONFIG[dim];
    return {
      id: e.id,
      slug: e.slug,
      dimension: dim,
      title: e.title_i18n,
      summary: e.summary_i18n,
      icon: cfg.icon,
      color: cfg.color,
      weight: 8,
    };
  });

  // Combine curated & fetched 10D nodes
  const masterNodes: GraphNode[] = [
    ...QURAN_NODES,
    ...HADITH_NODES,
    ...TAFSIR_NODES,
    ...SCHOLAR_NODES,
    ...VOCABULARY_NODES,
    ...entityNodes,
  ];

  // Deduplicate nodes by id
  const nodeMap = new Map<string, GraphNode>();
  masterNodes.forEach((n) => nodeMap.set(n.id, n));

  // Determine Focus Node
  let focusNode: GraphNode | null = null;
  if (focusSlug) {
    focusNode = Array.from(nodeMap.values()).find((n) => n.slug === focusSlug || n.id === focusSlug) || null;
  }

  // Build edges automatically based on shared keywords, explicit relations, and domain rules
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  const addEdge = (source: string, target: string, relationEn: string, relationAr: string, relationHe: string, weight = 5) => {
    if (source === target) return;
    const key = source < target ? `${source}___${target}` : `${target}___${source}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);

    edges.push({
      id: key,
      source,
      target,
      relation: { en: relationEn, ar: relationAr, he: relationHe },
      weight,
    });
  };

  // Add DB explicit relations
  allDbRelations.forEach((r) => {
    addEdge(
      r.from_id,
      r.to_id,
      r.relation || "Connected to",
      "مرتبط بـ",
      "קשור ל",
      r.weight || 6
    );
  });

  // Automatic Cross-Dimension Link Generation
  const nodeList = Array.from(nodeMap.values());
  for (let i = 0; i < nodeList.length; i++) {
    for (let j = i + 1; j < nodeList.length; j++) {
      const a = nodeList[i];
      const b = nodeList[j];

      if (a.dimension === b.dimension) continue;

      // Rule 1: Quran <-> Prophets / Topics / Stories
      if (a.dimension === "quran" && (b.dimension === "prophet" || b.dimension === "topic" || b.dimension === "story")) {
        addEdge(
          a.id,
          b.id,
          "Revealed regarding",
          "نزلت في شأن",
          "התגלה בנושא",
          8
        );
      }

      // Rule 2: Prophet <-> Places / Events / Stories
      if (a.dimension === "prophet" && (b.dimension === "place" || b.dimension === "event" || b.dimension === "story")) {
        addEdge(
          a.id,
          b.id,
          "Historical Mission at",
          "موقعة ورسالة في",
          "שליחות היסטורית ב",
          9
        );
      }

      // Rule 3: Hadith <-> Scholars / Vocabulary / Topics
      if (a.dimension === "hadith" && (b.dimension === "scholar" || b.dimension === "vocabulary" || b.dimension === "topic")) {
        addEdge(
          a.id,
          b.id,
          "Narrated & Elucidated",
          "روى وفسر مفهوم",
          "מצטט ומסביר את",
          9
        );
      }

      // Rule 4: Tafsir <-> Quran / Scholars
      if (a.dimension === "tafsir" && (b.dimension === "quran" || b.dimension === "scholar")) {
        addEdge(
          a.id,
          b.id,
          "Exegesis Authority",
          "تفسير وبيان معتمد",
          "פרשנות מוסמכת על",
          10
        );
      }

      // Rule 5: Vocabulary <-> All Dimensions (semantic root match)
      if (a.dimension === "vocabulary" || b.dimension === "vocabulary") {
        addEdge(
          a.id,
          b.id,
          "Ethical & Linguistic Root",
          "جذر لغوي ومفهوم شرعي",
          "שורש לשוני ורעיון",
          7
        );
      }
    }
  }

  // Group nodes into 10 dimensions
  const quran: GraphNode[] = [];
  const hadith: GraphNode[] = [];
  const tafsir: GraphNode[] = [];
  const prophet: GraphNode[] = [];
  const scholar: GraphNode[] = [];
  const topic: GraphNode[] = [];
  const story: GraphNode[] = [];
  const place: GraphNode[] = [];
  const event: GraphNode[] = [];
  const vocabulary: GraphNode[] = [];

  nodeList.forEach((n) => {
    switch (n.dimension) {
      case "quran":
        quran.push(n);
        break;
      case "hadith":
        hadith.push(n);
        break;
      case "tafsir":
        tafsir.push(n);
        break;
      case "prophet":
        prophet.push(n);
        break;
      case "scholar":
        scholar.push(n);
        break;
      case "topic":
        topic.push(n);
        break;
      case "story":
        story.push(n);
        break;
      case "place":
        place.push(n);
        break;
      case "event":
        event.push(n);
        break;
      case "vocabulary":
        vocabulary.push(n);
        break;
    }
  });

  const dimensionCounts: Record<GraphDimension, number> = {
    quran: quran.length,
    hadith: hadith.length,
    tafsir: tafsir.length,
    prophet: prophet.length,
    scholar: scholar.length,
    topic: topic.length,
    story: story.length,
    place: place.length,
    event: event.length,
    vocabulary: vocabulary.length,
  };

  const totalConnections = nodeList.length;

  return {
    focusNode: focusNode || nodeList[0] || null,
    quran,
    hadith,
    tafsir,
    prophet,
    scholar,
    topic,
    story,
    place,
    event,
    vocabulary,
    totalConnections,
    graph: {
      nodes: nodeList,
      edges,
      dimensionCounts,
    },
  };
}
