import { EntityRichMetadata, TopicHierarchy } from "@/types/entity-metadata";
import { KnowledgeEntity } from "./knowledge";
import { ALL_PROPHETS } from "./prophets";
import { ALL_TOPICS } from "./topics";
import seed from "@/lib/seeds/knowledge-seed.json";

// Default empty metadata helper
export function createDefaultMetadata(title?: string, slug?: string): EntityRichMetadata {
  const safeTitle = title ?? slug ?? "entity";
  return {
    primaryKeywords: [safeTitle.toLowerCase()],
    secondaryKeywords: [slug ?? "", "islamic concept", "quranic entity"].filter(Boolean),
    alternativeSpellings: [],
    arabicSynonyms: [],
    hebrewSynonyms: [],
    englishSynonyms: [],
    transliterations: [],
    pluralForms: [],
    rootWords: [],
    derivedWords: [],
    relatedConcepts: [],
    semanticTags: ["general", "knowledge"],
    topicHierarchies: {
      parentTopics: ["Islamic Knowledge"],
      childTopics: [],
    },
    emotionalCategories: [],
    jurisprudenceCategories: [],
    theologicalCategories: ["Aqeeda"],
    ethicsCategories: ["Islamic Ethics"],
    familyCategories: [],
    historicalCategories: [],
    characterTraits: [],
    virtues: [],
    sins: [],
    places: [],
    people: [],
    events: [],
  };
}

// Pre-curated metadata index for rich indexing and conceptual search
const METADATA_DATABASE: Record<string, EntityRichMetadata> = {
  // --- PROPHETS ---
  adam: {
    primaryKeywords: ["adam", "אדם", "آدم", "adam alayhis salam"],
    secondaryKeywords: ["first human", "first prophet", "father of humanity", "garden of eden"],
    alternativeSpellings: ["Adem", "Addam", "Adama"],
    arabicSynonyms: ["أبو البشر", "أول الأنبياء", "صفوة الله"],
    hebrewSynonyms: ["אדם הראשון", "אבי האנושות"],
    englishSynonyms: ["First Man", "Father of Mankind", "The Chosen Human"],
    transliterations: ["Adam", "Aadam", "Aadam 'Alayhis-Salam"],
    pluralForms: ["بنو آدم", "בני אדם", "Children of Adam"],
    rootWords: ["ء-د-م", "א-ד-מ"],
    derivedWords: ["أديم الأرض", "الأدمة", "أوادم"],
    relatedConcepts: [
      "creation",
      "tree of knowledge",
      "repentance",
      "angels prostration",
      "iblis arrogance",
    ],
    semanticTags: ["prophethood", "creation", "human nature", "repentance"],
    topicHierarchies: {
      parentTopics: ["Prophets in Islam", "Creation of Creation"],
      childTopics: ["Story of Adam and Eve", "Prostration of Angels", "Repentance of Adam"],
    },
    emotionalCategories: ["awe", "regret", "hope", "humility"],
    jurisprudenceCategories: ["covenants"],
    theologicalCategories: ["Prophethood (Nubuwwah)", "Divine Decree (Qadar)", "Angelology"],
    ethicsCategories: ["Repentance (Tawbah)", "Humility", "Guarding Against Pride"],
    familyCategories: ["Ancestry", "Parents and Children"],
    historicalCategories: ["Beginning of Humanity", "Antediluvian Era"],
    characterTraits: ["repentant", "teachable", "humble"],
    virtues: ["immediate repentance", "seeking forgiveness", "patience"],
    sins: [
      "disobedience to direct command (subsequently forgiven)",
      "falling for satanic deception",
    ],
    places: ["Jannah (Paradise)", "Earth"],
    people: ["Hawwa (Eve)", "Iblis (Satan)", "Angels"],
    events: [
      "Creation of Adam",
      "Prostration of Angels to Adam",
      "Expulsion from Paradise",
      "First Repentance",
    ],
  },

  nuh: {
    primaryKeywords: ["nuh", "noah", "נח", "نوح"],
    secondaryKeywords: ["great flood", "the ark", "patience in dawah", "prophet of endurance"],
    alternativeSpellings: ["Noach", "Nuhe"],
    arabicSynonyms: ["شيخ المرسلين", "سيد المسلمين الأولين"],
    hebrewSynonyms: ["נח הצדיק", "אבי האנושות השני"],
    englishSynonyms: ["Noah the Prophet", "Builder of the Ark"],
    transliterations: ["Nuh", "Nooh", "Nuh 'Alayhis-Salam"],
    pluralForms: ["قوم نوح", "عם נח", "People of Noah"],
    rootWords: ["ن-و-ح", "ن-ح-ر"],
    derivedWords: ["نوح", "مناحة", "تنويم"],
    relatedConcepts: ["patience in dawah", "divine justice", "deluge", "saving the believers"],
    semanticTags: ["prophethood", "perseverance", "the ark", "divine punishment"],
    topicHierarchies: {
      parentTopics: ["Ulul 'Azm (Resolute Prophets)", "Stories of the Prophets"],
      childTopics: ["Building the Ark", "The Great Flood", "Dawah of Nuh"],
    },
    emotionalCategories: ["grief for lost son", "unshakable patience", "trust in Allah"],
    jurisprudenceCategories: ["supplication during distress"],
    theologicalCategories: ["Monotheism", "Divine Punishment of Transgressors"],
    ethicsCategories: ["Steadfastness", "Patience in Preaching", "Grateful Servant"],
    familyCategories: ["Parent-Child Struggle", "Rebellious Son"],
    historicalCategories: ["The Great Deluge Era"],
    characterTraits: ["resolute", "patient", "enduring", "devout"],
    virtues: ["patience through centuries", "unwavering call to Allah", "gratitude"],
    sins: ["stubborn denial by disbelievers", "mockery of believers"],
    places: ["Mount Judi", "Mesopotamia"],
    people: ["Son of Nuh", "Wife of Nuh", "Believers on the Ark"],
    events: ["The Great Deluge", "Construction of the Ark", "Warning the Rebellious People"],
  },

  ibrahim: {
    primaryKeywords: ["ibrahim", "abraham", "אברהם", "إبراهيم"],
    secondaryKeywords: [
      "khalilullah",
      "friend of God",
      "father of prophets",
      "kaaba builder",
      "pure monotheism",
    ],
    alternativeSpellings: ["Ibrahim", "Avraham", "Abrahim"],
    arabicSynonyms: ["خليل الرحمن", "أبو الأنبياء", "إمام الناس"],
    hebrewSynonyms: ["אברהם אבינו", "אברהם העברי", "ידיד האל"],
    englishSynonyms: ["Friend of Allah", "Father of Prophets", "Patriarch Abraham"],
    transliterations: ["Ibrahim", "Ibraheem", "Ibrahim Al-Khalil"],
    pluralForms: ["آل إبراهيم", "ملة إبراهيم", "Nation of Abraham"],
    rootWords: ["ب-ر-ه-م", "أ-ب-ر"],
    derivedWords: ["إبراهيمي", "الخِلة", "الخليل"],
    relatedConcepts: [
      "hanifiyyah",
      "pure monotheism",
      "sacrifice of ismail",
      "building kaaba",
      "hajj rites",
    ],
    semanticTags: ["monotheism", "prophethood", "kaaba", "sacrifice", "hospitality"],
    topicHierarchies: {
      parentTopics: ["Ulul 'Azm (Resolute Prophets)", "Foundations of Faith"],
      childTopics: [
        "Building the Kaaba",
        "Trial of the Fire",
        "Sacrifice of Ismail",
        "Milla Ibrahim",
      ],
    },
    emotionalCategories: ["unshakeable conviction", "tenderness", "awe", "devotion"],
    jurisprudenceCategories: ["Hajj Pilgrimage", "Sacrifice (Qurbani/Udhiyah)"],
    theologicalCategories: ["Tawhid (Absolute Monotheism)", "Prophethood", "Sacred Covenants"],
    ethicsCategories: [
      "Hospitality to Strangers",
      "Gentle Dawah to Parents",
      "Complete Submission",
    ],
    familyCategories: ["Parental Relationship", "Fatherhood", "Sacred Lineage"],
    historicalCategories: ["Babylonian Era", "Building of Ancient Mecca"],
    characterTraits: ["hanif", "tender-hearted", "forbearing", "brave"],
    virtues: [
      "unwavering monotheism",
      "hospitality",
      "willingness to sacrifice",
      "sound heart (Qalb Salim)",
    ],
    sins: ["idolatry (opposed by Ibrahim)", "tyranny of Nimrod"],
    places: ["Mecca", "Al-Quds (Hebron/Jerusalem)", "Ur of Chaldees", "Syria"],
    people: ["Ismail", "Ishaq", "Sarah", "Hajar", "Nimrod", "Azar"],
    events: [
      "Thrown into the Fire",
      "Building of the Kaaba",
      "Sacrifice of Ismail",
      "Debate with Nimrod",
    ],
  },

  musa: {
    primaryKeywords: ["musa", "moses", "משה", "موسى"],
    secondaryKeywords: ["kalimullah", "pharaoh", "exodus", "mount sinai", "torah", "red sea split"],
    alternativeSpellings: ["Mousse", "Moises", "Moshe"],
    arabicSynonyms: ["كليم الله", "منجي بني إسرائيل"],
    hebrewSynonyms: ["משה רבנו", "איש האלוהים", "מנהיג היציאה"],
    englishSynonyms: ["Moses the Speaker with God", "Deliverer of Israel"],
    transliterations: ["Musa", "Moosa", "Musa Kalimullah"],
    pluralForms: ["قوم موسى", "بنو إسرائيل", "Children of Israel"],
    rootWords: ["م-و-س", "م-ش-ه"],
    derivedWords: ["موسوي", "الطور", "الصحف"],
    relatedConcepts: [
      "liberation",
      "speaking directly with God",
      "torah revelation",
      "confronting tyranny",
      "patience",
    ],
    semanticTags: ["liberation", "law", "revelation", "miracles", "prophethood"],
    topicHierarchies: {
      parentTopics: ["Ulul 'Azm (Resolute Prophets)", "Stories of the Prophets"],
      childTopics: [
        "Confronting Pharaoh",
        "Parting of the Red Sea",
        "Mount Sinai Revelation",
        "Story with Khidr",
      ],
    },
    emotionalCategories: [
      "righteous anger against injustice",
      "fear transformed into courage",
      "relevance",
    ],
    jurisprudenceCategories: ["Divine Commandments", "Law and Order", "Justice"],
    theologicalCategories: [
      "Direct Divine Speech (Kalam Allah)",
      "Miracles (Mu'jizat)",
      "Scriptures",
    ],
    ethicsCategories: ["Confronting Injustice", "Modesty", "Trust in Allah's Plan"],
    familyCategories: ["Brotherhood with Harun", "Mother's Faith"],
    historicalCategories: ["Pharaonic Egypt Era", "Exodus", "Wandering in Sinai"],
    characterTraits: ["strong", "trustworthy", "courageous", "passionate for justice"],
    virtues: [
      "speaking truth to power",
      "trust in Allah at the sea",
      "humility to learn from Khidr",
    ],
    sins: ["oppression by Pharaoh", "arrogance of Karun (Korah)", "calf worship by Samiri"],
    places: ["Egypt", "Mount Sinai (Tuwa)", "Red Sea", "Madyan"],
    people: ["Harun", "Pharaoh (Fir'awn)", "Asiya", "Khidr", "Yusha ibn Nun", "Karun"],
    events: [
      "Cast into the Nile",
      "Fleeing to Madyan",
      "Burning Bush at Mount Tuwa",
      "Parting of the Sea",
      "Golden Calf",
    ],
  },

  isa: {
    primaryKeywords: ["isa", "jesus", "ישוע", "عيسى"],
    secondaryKeywords: ["al-masih", "messiah", "son of mary", "injil", "miracles of jesus"],
    alternativeSpellings: ["Eesa", "Yeshua", "Issa"],
    arabicSynonyms: ["المسيح", "روح الله", "كلمة الله", "ابن مريم"],
    hebrewSynonyms: ["ישוע הנוצרי", "המשיח", "בן מרים"],
    englishSynonyms: ["Jesus Christ", "The Messiah", "Spirit of God"],
    transliterations: ["'Isa", "Isa al-Masih", "Ibn Maryam"],
    pluralForms: ["الحواريون", "תלמידי ישוע", "Disciples"],
    rootWords: ["ع-ي-س", "م-س-ح"],
    derivedWords: ["عيسوي", "المسيحية", "مسحي"],
    relatedConcepts: [
      "virgin birth",
      "miracles",
      "injil revelation",
      "monotheistic message",
      "second coming",
    ],
    semanticTags: ["messiah", "miracles", "gospel", "prophethood", "reverence"],
    topicHierarchies: {
      parentTopics: ["Ulul 'Azm (Resolute Prophets)", "Stories of the Prophets"],
      childTopics: [
        "Virgin Birth of Maryam",
        "Miracles in Childhood",
        "The Disciples (Hawariyyun)",
        "Ascension",
      ],
    },
    emotionalCategories: ["compassion", "gentleness", "peace", "spiritual devotion"],
    jurisprudenceCategories: ["Monasticism vs Balance", "Pure Worship"],
    theologicalCategories: ["Prophethood", "Miraculous Birth", "Word from Allah (Kalimatullah)"],
    ethicsCategories: ["Asceticism (Zuhd)", "Humility", "Compassion to the Needy"],
    familyCategories: ["Miraculous Motherhood", "Lineage of Imran"],
    historicalCategories: ["Roman Judea Era"],
    characterTraits: ["ascetic", "compassionate", "gentle", "truthful"],
    virtues: ["healing the sick", "speaking truth in the cradle", "filial piety to Maryam"],
    sins: ["exaggeration in religion (Ghuluw)", "associating partners with God"],
    places: ["Bethlehem", "Jerusalem", "Nazareth"],
    people: ["Maryam (Mary)", "Al-Hawariyyun (Disciples)", "Yahya (John the Baptist)", "Zakariya"],
    events: [
      "Miraculous Birth",
      "Speaking in the Cradle",
      "The Heavenly Table (Al-Ma'idah)",
      "Ascension to Heaven",
    ],
  },

  muhammad: {
    primaryKeywords: ["muhammad", "mohammed", "מוחמד", "محمد"],
    secondaryKeywords: [
      "rasulullah",
      "seal of the prophets",
      "quran revelation",
      "mecca and medina",
      "sunnah",
    ],
    alternativeSpellings: ["Mohamed", "Muhammed", "Mahomet"],
    arabicSynonyms: ["خاتم النبيين", "رسول الله", "الصادق الأمين", "حبيب الرحمن", "رحمة للعالمين"],
    hebrewSynonyms: ["חותם הנביאים", "שליח האל"],
    englishSynonyms: ["Messenger of Allah", "Seal of the Prophets", "Mercy to All Worlds"],
    transliterations: ["Muhammad", "Sallallahu 'Alayhi wa Sallam", "Ahmad"],
    pluralForms: ["أمة محمد", "الصحابة الكرام", "The Ummah"],
    rootWords: ["ح-م-د", "ח-מ-ד"],
    derivedWords: ["أحمد", "محمود", "التحميد", "حماد"],
    relatedConcepts: [
      "final revelation",
      "quran",
      "sunnah",
      "mercy to mankind",
      "seerah",
      "night journey (isra wal miraj)",
    ],
    semanticTags: ["final prophet", "quran", "mercy", "guidance", "seerah"],
    topicHierarchies: {
      parentTopics: ["Ulul 'Azm (Resolute Prophets)", "The Final Message"],
      childTopics: [
        "Revelation of Quran",
        "Hijrah to Medina",
        "Isra and Mi'raj",
        "Conquest of Mecca",
      ],
    },
    emotionalCategories: ["deep mercy", "love for humanity", "gratitude", "unyielding faith"],
    jurisprudenceCategories: ["Islamic Law (Shariah)", "Sunnah Norms", "Governance"],
    theologicalCategories: ["Finality of Prophethood (Khatam an-Nabiyyin)", "Universal Message"],
    ethicsCategories: [
      "Exemplary Character (Khuluq 'Azim)",
      "Honesty",
      "Trustworthiness",
      "Forgiveness",
    ],
    familyCategories: ["Ahl al-Bayt", "Husband and Father Role Model"],
    historicalCategories: ["7th Century Arabia", "Makkan Period", "Madinan State"],
    characterTraits: ["merciful", "honest", "trustworthy", "patient", "courageous", "humble"],
    virtues: ["forgiving enemies", "patience under persecution", "generosity", "justice"],
    sins: ["rejecting divine guidance", "hypocrisy (Nifaq)", "arrogance"],
    places: ["Mecca", "Medina", "Cave Hira", "Al-Aqsa (Jerusalem)", "Badr", "Uhud"],
    people: ["Khadijah", "Aisha", "Abu Bakr", "Umar", "Uthman", "Ali", "Ansar", "Muhajirun"],
    events: [
      "First Revelation in Hira",
      "Isra and Mi'raj",
      "Hijrah to Medina",
      "Battle of Badr",
      "Conquest of Mecca",
      "Farewell Pilgrimage",
    ],
  },

  // --- TOPICS & CONCEPTS ---
  tawhid: {
    primaryKeywords: ["tawhid", "monotheism", "ייחוד האל", "التوحيد"],
    secondaryKeywords: [
      "oneness of god",
      "oneness of allah",
      "aqeeda",
      "la ilaha illallah",
      "shirk rejection",
    ],
    alternativeSpellings: ["Tauhid", "Tawheed", "Tawhid"],
    arabicSynonyms: ["وحدانية الله", "إفراد الله بالعبادة", "كلمة الإخلاص"],
    hebrewSynonyms: ["אחדות הבורא", "ייחוד השם", "אמונת היחוד"],
    englishSynonyms: ["Islamic Monotheism", "Divine Unity", "Oneness of Creator"],
    transliterations: ["Tawhid", "Tawheed", "Tawheed al-Uluhiyyah"],
    pluralForms: ["أهل التوحيد", "מאמינים ביחוד", "Monotheists"],
    rootWords: ["و-ح-د", "ו-ח-ד"],
    derivedWords: ["واحد", "أحد", "وحيد", "توحيدي"],
    relatedConcepts: [
      "shahada",
      "shirk warning",
      "names and attributes of Allah",
      "sura al-ikhlas",
      "ayat al-kursi",
    ],
    semanticTags: ["theology", "core belief", "monotheism", "pillars of faith"],
    topicHierarchies: {
      parentTopics: ["Foundations of Faith (Aqeeda)"],
      childTopics: ["Tawhid al-Rububiyyah", "Tawhid al-Uluhiyyah", "Tawhid al-Asma was-Sifat"],
    },
    emotionalCategories: ["peace of mind", "clarity", "awe", "reverence"],
    jurisprudenceCategories: ["Pillars of Islam", "Validity of Faith"],
    theologicalCategories: ["Tawhid", "Attributes of God", "Anti-Shirk"],
    ethicsCategories: ["Sincerity (Ikhlas)", "Single-minded Devotion"],
    familyCategories: ["Teaching Children Monotheism"],
    historicalCategories: ["Core Message of All Prophets"],
    characterTraits: ["sincere", "devoted", "focused"],
    virtues: ["absolute sincerity", "freedom from worshiping creations"],
    sins: ["Shirk (polytheism/associating partners)", "Riyaa (showing off)"],
    places: ["Kaaba", "Masjid al-Haram"],
    people: ["Ibrahim", "All Prophets"],
    events: ["Proclamation of Shahada"],
  },

  patience: {
    primaryKeywords: ["patience", "sabr", "סבלנות", "الصبر"],
    secondaryKeywords: ["endurance", "perseverance", "steadfastness", "sabr in affliction"],
    alternativeSpellings: ["Sabre", "Sabar", "Sbr"],
    arabicSynonyms: ["الصبر والاحتساب", "المصابرة", "الجلد"],
    hebrewSynonyms: ["אורך רוח", "עמידות", "סבלנות ואמונה"],
    englishSynonyms: ["Perseverance", "Steadfastness", "Forbearance", "Patience"],
    transliterations: ["Sabr", "As-Sabr", "Sabr Jameel"],
    pluralForms: ["الصابرون", "סבלניים", "The Patient Ones"],
    rootWords: ["ص-ب-ر", "ס-ב-ר"],
    derivedWords: ["صابر", "صبور", "اصطبار", "مصابرة"],
    relatedConcepts: [
      "trials and tribulations",
      "sabr jameel",
      "gratitude (shukr)",
      "reward without account",
    ],
    semanticTags: ["ethics", "virtue", "character", "coping with hardship"],
    topicHierarchies: {
      parentTopics: ["Quranic Ethics", "Spiritual Purification (Tazkiyah)"],
      childTopics: ["Patience in Worship", "Patience in Hardship", "Patience from Sin"],
    },
    emotionalCategories: ["tranquility amidst storm", "inner strength", "perseverance"],
    jurisprudenceCategories: ["Spiritual Obligations"],
    theologicalCategories: ["Trust in Divine Wisdom (Tawakkul)", "Tests of Life"],
    ethicsCategories: ["Sabr", "Self-Control", "Resilience"],
    familyCategories: ["Patience with Family"],
    historicalCategories: ["Trials of Early Muslims"],
    characterTraits: ["patient", "resilient", "steadfast", "calm"],
    virtues: ["Sabr Jameel (beautiful patience)", "trusting Allah during calamity"],
    sins: ["Impatience", "Despair from Allah's Mercy", "Complaining destructively"],
    places: [],
    people: ["Ayyub (Job)", "Yaqub (Jacob)", "Prophet Muhammad"],
    events: ["Year of Sorrow", "Trials of Ayyub"],
  },

  justice: {
    primaryKeywords: ["justice", "adl", "צדק", "العدل"],
    secondaryKeywords: ["fairness", "equity", "qist", "balance", "human rights in islam"],
    alternativeSpellings: ["Adel", "Adal", "Qist"],
    arabicSynonyms: ["القسط", "الإنصاف", "ميزان الحق"],
    hebrewSynonyms: ["יושר", "משפט צדק", "הגינות"],
    englishSynonyms: ["Justice", "Equity", "Fairness", "Impartiality"],
    transliterations: ["'Adl", "Al-Qist", "Al-Mizan"],
    pluralForms: ["العادلون", "المقسطون", "The Just Ones"],
    rootWords: ["ع-د-ل", "ق-س-ط"],
    derivedWords: ["عادل", "عدالة", "تعديل", "مقسط"],
    relatedConcepts: [
      "rule of law",
      "witnessing for god",
      "anti-oppression",
      "scales on judgment day",
    ],
    semanticTags: ["governance", "ethics", "social law", "judgment"],
    topicHierarchies: {
      parentTopics: ["Social Order and Governance", "Quranic Ethics"],
      childTopics: ["Fair Witnesses", "Judicial Equity", "Anti-Oppression"],
    },
    emotionalCategories: ["security", "trust", "righteous satisfaction"],
    jurisprudenceCategories: ["Judiciary (Qada)", "Governance (Siyasa Shariyya)"],
    theologicalCategories: ["Divine Justice (Al-Adl)", "Day of Recompense"],
    ethicsCategories: ["Honesty in Testimony", "Fair Dealing", "Eliminating Favoritism"],
    familyCategories: ["Equity Among Children", "Justice Between Spouses"],
    historicalCategories: ["Medina Constitution", "Pact of Fudul"],
    characterTraits: ["impartial", "just", "trustworthy", "fair"],
    virtues: ["standing up for truth even against oneself", "giving exact measure"],
    sins: ["Injustice (Zulm)", "False Testimony", "Fraud in Weights"],
    places: ["Court of Law"],
    people: ["Umar ibn al-Khattab", "Prophet Muhammad"],
    events: ["Pact of Hilf al-Fudul"],
  },

  mercy: {
    primaryKeywords: ["mercy", "rahmah", "רחמים", "الرحمة"],
    secondaryKeywords: ["compassion", "ar-rahman", "ar-rahim", "divine mercy", "kindness"],
    alternativeSpellings: ["Rahma", "Rachamim", "Rahmah"],
    arabicSynonyms: ["الرأفة", "الحنان", "الشفقة", "اللطف"],
    hebrewSynonyms: ["חמלה", "חסד", "טוב לב"],
    englishSynonyms: ["Compassion", "Loving-Kindness", "Grace", "Mercy"],
    transliterations: ["Rahmah", "Ar-Rahman", "Ar-Rahim"],
    pluralForms: ["الرحماء", "הרחมนים", "The Merciful Ones"],
    rootWords: ["ر-ح-م", "ר-ח-מ"],
    derivedWords: ["رحيم", "رحمن", "رحم", "ترحّم"],
    relatedConcepts: [
      "basmalah",
      "rahat alli",
      "forgiveness",
      "mercy to parents",
      "compassion to creation",
    ],
    semanticTags: ["divine attributes", "ethics", "character", "forgiveness"],
    topicHierarchies: {
      parentTopics: ["Names and Attributes of Allah", "Quranic Ethics"],
      childTopics: ["Divine Mercy", "Human Compassion", "Mercy to Animals"],
    },
    emotionalCategories: ["warmth", "comfort", "relief", "love"],
    jurisprudenceCategories: ["Ease in Shariah (Rukhsah)"],
    theologicalCategories: ["Divine Mercy Encompassing All Things"],
    ethicsCategories: ["Kindness to Weak", "Forgiving Wrongs", "Gentleness"],
    familyCategories: ["Mercy and Affection Between Spouses (Mawaddah wa Rahmah)"],
    historicalCategories: ["Pardon of Mecca"],
    characterTraits: ["compassionate", "gentle", "forgiving"],
    virtues: ["showing mercy to earth dwellers", "pardon when able"],
    sins: ["Cruelty", "Harshness of Heart", "Despair of God's Mercy"],
    places: [],
    people: ["Prophet Muhammad (Mercy to Mankind)"],
    events: ["Conquest of Mecca Amnesty"],
  },
};

export function getRichMetadataForEntity(
  slugOrId: string,
  title?: string,
  kind?: string,
): EntityRichMetadata {
  const cleanKey = slugOrId.replace(/^seed:/, "").toLowerCase();
  if (METADATA_DATABASE[cleanKey]) {
    return METADATA_DATABASE[cleanKey];
  }

  // Generate intelligent structured fallback based on title and kind
  const base = createDefaultMetadata(title, cleanKey);
  if (kind === "prophet") {
    base.semanticTags = ["prophethood", "divine guidance", "quranic narrative"];
    base.topicHierarchies.parentTopics = ["Prophets in Islam"];
    base.theologicalCategories = ["Prophethood (Nubuwwah)"];
    base.characterTraits = ["righteous", "truthful", "guided"];
    base.virtues = ["dawah", "patience", "monotheism"];
    base.primaryKeywords.push(`${cleanKey} prophet`, `${title ?? cleanKey}`);
  } else if (kind === "topic" || kind === "concept" || kind === "theme") {
    base.semanticTags = ["quranic topic", "islamic ethics", "guidance"];
    base.topicHierarchies.parentTopics = ["Quranic Themes"];
    base.primaryKeywords.push(`${cleanKey}`, `${title ?? cleanKey}`);
  } else if (kind === "place") {
    base.semanticTags = ["geography", "sacred places", "historical sites"];
    base.places = [title ?? cleanKey];
  } else if (kind === "event" || kind === "story") {
    base.semanticTags = ["history", "quranic stories", "lessons"];
    base.events = [title ?? cleanKey];
  }

  return base;
}

// Function to validate any metadata structure against the internal database entities
export function validateMetadataAgainstDb(
  metadata: Partial<EntityRichMetadata>,
): EntityRichMetadata {
  const allKnownSlugs = new Set([
    ...ALL_PROPHETS.map((p) => p.slug),
    ...ALL_TOPICS.map((t) => t.slug),
    ...seed.entities.map((e) => e.slug),
  ]);

  const validated: EntityRichMetadata = {
    primaryKeywords: (metadata.primaryKeywords ?? []).map((s) => s.trim()).filter(Boolean),
    secondaryKeywords: (metadata.secondaryKeywords ?? []).map((s) => s.trim()).filter(Boolean),
    alternativeSpellings: (metadata.alternativeSpellings ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    arabicSynonyms: (metadata.arabicSynonyms ?? []).map((s) => s.trim()).filter(Boolean),
    hebrewSynonyms: (metadata.hebrewSynonyms ?? []).map((s) => s.trim()).filter(Boolean),
    englishSynonyms: (metadata.englishSynonyms ?? []).map((s) => s.trim()).filter(Boolean),
    transliterations: (metadata.transliterations ?? []).map((s) => s.trim()).filter(Boolean),
    pluralForms: (metadata.pluralForms ?? []).map((s) => s.trim()).filter(Boolean),
    rootWords: (metadata.rootWords ?? []).map((s) => s.trim()).filter(Boolean),
    derivedWords: (metadata.derivedWords ?? []).map((s) => s.trim()).filter(Boolean),
    relatedConcepts: (metadata.relatedConcepts ?? []).map((s) => s.trim()).filter(Boolean),
    semanticTags: (metadata.semanticTags ?? []).map((s) => s.trim()).filter(Boolean),
    topicHierarchies: {
      parentTopics: (metadata.topicHierarchies?.parentTopics ?? ["Islamic Knowledge"])
        .map((s) => s.trim())
        .filter(Boolean),
      childTopics: (metadata.topicHierarchies?.childTopics ?? [])
        .map((s) => s.trim())
        .filter(Boolean),
    },
    emotionalCategories: (metadata.emotionalCategories ?? []).map((s) => s.trim()).filter(Boolean),
    jurisprudenceCategories: (metadata.jurisprudenceCategories ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    theologicalCategories: (metadata.theologicalCategories ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    ethicsCategories: (metadata.ethicsCategories ?? []).map((s) => s.trim()).filter(Boolean),
    familyCategories: (metadata.familyCategories ?? []).map((s) => s.trim()).filter(Boolean),
    historicalCategories: (metadata.historicalCategories ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    characterTraits: (metadata.characterTraits ?? []).map((s) => s.trim()).filter(Boolean),
    virtues: (metadata.virtues ?? []).map((s) => s.trim()).filter(Boolean),
    sins: (metadata.sins ?? []).map((s) => s.trim()).filter(Boolean),
    places: (metadata.places ?? []).map((s) => s.trim()).filter(Boolean),
    people: (metadata.people ?? []).map((s) => s.trim()).filter(Boolean),
    events: (metadata.events ?? []).map((s) => s.trim()).filter(Boolean),
  };

  // Cross-reference related people & places with known database entities
  validated.people = validated.people.map((person) => {
    const clean = person.toLowerCase().trim();
    return allKnownSlugs.has(clean) ? clean : person;
  });

  return validated;
}
