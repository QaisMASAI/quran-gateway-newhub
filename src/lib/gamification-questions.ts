// Comprehensive Question Database for Noor Islamic Learning Platform
// Supports 13 game modes across Arabic, English, and Hebrew

export type GameMode =
  | "guess_surah"
  | "guess_prophet"
  | "guess_companion"
  | "complete_verse"
  | "complete_hadith"
  | "verse_context"
  | "hadith_context"
  | "chronology"
  | "true_false"
  | "multiple_choice"
  | "image_recognition"
  | "relationship_matching"
  | "topic_matching";

export type QuestionDifficulty = "easy" | "medium" | "hard" | "scholar";

export interface MatchingPair {
  id: string;
  leftAr: string;
  leftEn: string;
  leftHe: string;
  rightAr: string;
  rightEn: string;
  rightHe: string;
}

export interface ChronologyItem {
  id: string;
  textAr: string;
  textEn: string;
  textHe: string;
  order: number;
}

export interface QuestionItem {
  id: string;
  mode: GameMode;
  difficulty: QuestionDifficulty;
  category: "quran" | "hadith" | "prophets" | "companions" | "history" | "tafsir" | "ethics";
  titleAr: string;
  titleEn: string;
  titleHe: string;
  promptAr: string;
  promptEn: string;
  promptHe: string;
  image?: string;
  // Standard MCQ / True-False / Guess modes
  optionsAr?: string[];
  optionsEn?: string[];
  optionsHe?: string[];
  correctIndex?: number;
  correctBoolean?: boolean;
  // Fill in blanks / Tile selection
  fillTokensAr?: string[];
  fillTokensEn?: string[];
  fillTokensHe?: string[];
  correctOrderIndices?: number[];
  // Matching modes
  matchingPairs?: MatchingPair[];
  // Chronology mode
  chronologyItems?: ChronologyItem[];
  // AI Explanation & Citation
  aiExplanationAr: string;
  aiExplanationEn: string;
  aiExplanationHe: string;
  citation: string;
}

export const QUESTION_DATABASE: QuestionItem[] = [
  // 1. GUESS THE SURAH
  {
    id: "gs_1",
    mode: "guess_surah",
    difficulty: "easy",
    category: "quran",
    titleAr: "خَمِّن السورة القرآنية",
    titleEn: "Guess the Surah",
    titleHe: "זהה את הסורה",
    promptAr:
      "سورة مكية تُسمى 'أم الكتاب' و'السبع المثاني'، تُقرأ في كل ركعة من الصلاة وتحوي 7 آيات.",
    promptEn:
      "Meccan Surah known as 'The Mother of the Book' and 'The Seven Oft-Repeated Verses', recited in every rak'ah of prayer.",
    promptHe:
      "סורה מכאית הידועה כ'אם הספר' ו'שבעת החוזרים', נקראת בכל כרעה בתפילה וכוללת 7 פסוקים.",
    optionsAr: ["سورة الفاتحة", "سورة البقرة", "سورة الإخلاص", "سورة يس"],
    optionsEn: ["Surah Al-Fatihah", "Surah Al-Baqarah", "Surah Al-Ikhlas", "Surah Ya-Sin"],
    optionsHe: ["סורת אל-פאתיחה", "סורת אל-בשרה", "סורת אל-איח'לאס", "סורת יא-סין"],
    correctIndex: 0,
    aiExplanationAr:
      "سورة الفاتحة هي أول سورة في المصحف الشريف، وتسمى الشافية وأم القرآن والسبع المثاني لأنها سبع آيات تُثنى وتُكرر في كل صلاة. (صحيح البخاري، كتاب التفسير).",
    aiExplanationEn:
      "Surah Al-Fatihah is the opening chapter of the Quran. It is called 'As-Sab' al-Mathani' (The Seven Oft-Repeated Verses) because its seven verses are recited in every unit of Islamic prayer. (Sahih al-Bukhari).",
    aiExplanationHe:
      "סורת אל-פאתיחה היא הסורה הפותחת את הקוראן. היא נקראת 'שבעת המופתים' כי היא נאמרת בכל כרעת תפילה. (צחיח אל-בוח'ארי).",
    citation: "Surah Al-Fatihah (1:1-7)",
  },
  {
    id: "gs_2",
    mode: "guess_surah",
    difficulty: "medium",
    category: "quran",
    titleAr: "خَمِّن السورة القرآنية",
    titleEn: "Guess the Surah",
    titleHe: "זהה את הסורה",
    promptAr: "أطول سورة في القرآن الكريم، تحوي آية الكرسي وآية الدين، وتُسمى 'سنام القرآن'.",
    promptEn:
      "The longest Surah in the Quran, containing Ayat al-Kursi and the Debt Verse, referred to as the 'Pinnacle of the Quran'.",
    promptHe: "הסורה הארוכה ביותר בקוראן, כוללת את פסוק הכסא ופסוק החוב, ומכונה 'שיא הקוראן'.",
    optionsAr: ["سورة آل عمران", "سورة البقرة", "سورة النساء", "سورة الكهف"],
    optionsEn: ["Surah Ali 'Imran", "Surah Al-Baqarah", "Surah An-Nisa", "Surah Al-Kahf"],
    optionsHe: ["סורת אל עמראן", "סורת אל-בשרה", "סורת א-ניסאא", "סורת אל-כהף"],
    correctIndex: 1,
    aiExplanationAr:
      "سورة البقرة هي أطول سور القرآن الكريم وتضمن أحكاما فقهية وقصصية كبرى، وقال النبي ﷺ: 'اقرءوا سورة البقرة فإن أخذها بركة وتركها حسرة ولا تستطيعها البطلة'. (صحيح مسلم).",
    aiExplanationEn:
      "Surah Al-Baqarah contains 286 verses, including Ayat al-Kursi (2:255). Prophet Muhammad ﷺ noted that reciting it brings blessings and protects against falsehood. (Sahih Muslim).",
    aiExplanationHe:
      "סורת אל-בשרה כוללת 286 פסוקים. הנביא מוחמד ﷺ ציין שקריאתה מביאה ברכה ומגנה מפני חטא. (צחיח מוסלים).",
    citation: "Surah Al-Baqarah (2:1-286)",
  },

  // 2. GUESS THE PROPHET
  {
    id: "gp_1",
    mode: "guess_prophet",
    difficulty: "easy",
    category: "prophets",
    titleAr: "خَمِّن النبي الكريم",
    titleEn: "Guess the Prophet",
    titleHe: "זהה את הנביא",
    promptAr: "نبيٌّ خلقه الله من غير أب ولا أم، وهو أول البشر وأبو الإنسانية جمعاء.",
    promptEn:
      "The first human being and prophet created by Allah directly from clay without parents, father of all humanity.",
    promptHe: "האדם והנביא הראשון שנברא ישירות על ידי אללה ללא הורים, אבי כל האנושות.",
    optionsAr: ["آدم عليه السلام", "نوح عليه السلام", "إبراهيم عليه السلام", "إدريس عليه السلام"],
    optionsEn: [
      "Prophet Adam (pbuh)",
      "Prophet Noah (pbuh)",
      "Prophet Abraham (pbuh)",
      "Prophet Enoch (pbuh)",
    ],
    optionsHe: [
      "הנביא אדם עליו השלום",
      "הנביא נח עליו השלום",
      "הנביא אברהם עליו השלום",
      "הנביא חנוך עליו השלום",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "آدم عليه السلام هو أول الأنبياء وأبو البشرية خلق من طين ونفخ الله فيه من روحه وأسكنه وزوجه الجنة ثم أهبطا لإعمار الأرض.",
    aiExplanationEn:
      "Prophet Adam (peace be upon him) was the first human created by Allah, taught the names of all things, and appointed as a vicegerent on Earth.",
    aiExplanationHe:
      "הנביא אדם עליו השלום היה האדם הראשון שנברא על ידי אללה, למד את שמות כל הדברים ומונה לח'ליפה על הארץ.",
    citation: "Surah Al-Baqarah (2:30-39)",
  },
  {
    id: "gp_2",
    mode: "guess_prophet",
    difficulty: "medium",
    category: "prophets",
    titleAr: "خَمِّن النبي الكريم",
    titleEn: "Guess the Prophet",
    titleHe: "זהה את הנביא",
    promptAr:
      "نبي كليماً كلمه الله تكليماً، وأتاه التوراة وفلق الله له البحر لنجاته وقومه من فرعون.",
    promptEn:
      "The Prophet who spoke directly with Allah (Kalimullah), received the Torah, and parted the Red Sea by Allah's permission.",
    promptHe:
      "הנביא שדיבר ישירות עם אללה, קיבל את התורה ובקע את ים סוף ברשות אללה כדי להציל את עמו מפרעה.",
    optionsAr: ["موسى عليه السلام", "عيسى عليه السلام", "يوسف عليه السلام", "سليمان عليه السلام"],
    optionsEn: [
      "Prophet Moses (pbuh)",
      "Prophet Jesus (pbuh)",
      "Prophet Joseph (pbuh)",
      "Prophet Solomon (pbuh)",
    ],
    optionsHe: [
      "הנביא משה עליו השלום",
      "הנביא ישוע עליו השלום",
      "הנביא יוסף עליו השלום",
      "הנביא שלמה עליו השלום",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "موسى بن عمران عليه السلام هو كليم الله وأحد أولي العزم من الرسل، أرسل لفرعون وبني إسرائيل بالآيات والمعجزات الباهرات.",
    aiExplanationEn:
      "Prophet Musa (Moses) peace be upon him is mentioned most frequently in the Quran (136 times). Allah spoke to him at Mount Sinai and performed mighty miracles.",
    aiExplanationHe:
      "הנביא משה עליו השלום מוזכר הכי הרבה פעמים בקוראן (136 פעמים). אללה דיבר איתו בהר סיני והוא עשה מופתים גדולים.",
    citation: "Surah Taha (20:9-98)",
  },

  // 3. GUESS THE COMPANION
  {
    id: "gc_1",
    mode: "guess_companion",
    difficulty: "easy",
    category: "companions",
    titleAr: "خَمِّن الصحابي الجليل",
    titleEn: "Guess the Companion",
    titleHe: "זהה את הסחאבי",
    promptAr:
      "أول الخلفاء الراشدين، وأحب الرجال إلى رسول الله ﷺ، ورفيقه في الهجرة النبوية إلى المدينة.",
    promptEn:
      "The first Caliph of Islam, closest male friend to Prophet Muhammad ﷺ, and his companion during the Hijrah to Medina.",
    promptHe: "הח'ליפה הראשון, הֶחָבֵר הקרוב ביותר לנביא מוחמד ﷺ ושותפו למסע ההג'רה למדינה.",
    optionsAr: [
      "أبو بكر الصديق رضي الله عنه",
      "عمر بن الخطاب رضي الله عنه",
      "عثمان بن عفان رضي الله عنه",
      "علي بن أبي طالب رضي الله عنه",
    ],
    optionsEn: [
      "Abu Bakr As-Siddiq (ra)",
      "Umar ibn Al-Khattab (ra)",
      "Uthman ibn Affan (ra)",
      "Ali ibn Abi Talib (ra)",
    ],
    optionsHe: [
      "אבו בכר א-סדיק (רע)",
      "עומר בן אל-ח'טאב (רע)",
      "עות'מאן בן עפאן (רע)",
      "עלי בן אבי טאלב (רע)",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "أبو بكر الصديق عبد الله بن أبي قحافة رضي الله عنه هو أول من آمن من الرجال بالرسول ﷺ وسمي بالصديق لتصديقه حادثة الإسراء والمعراج.",
    aiExplanationEn:
      "Abu Bakr As-Siddiq (May Allah be pleased with him) was given the title 'As-Siddiq' (The Truthful) for his immediate faith in the Prophet's Night Journey (Isra & Mi'raj).",
    aiExplanationHe:
      "אבו בכר א-סדיק (רע) קיבל את התואר 'א-סדיק' (הנאמן) על אמונתו המיידית במסע הלילה של הנביא (איסראא ומעראג').",
    citation: "Surah At-Tawbah (9:40) & Sahih al-Bukhari",
  },

  // 4. COMPLETE THE VERSE
  {
    id: "cv_1",
    mode: "complete_verse",
    difficulty: "easy",
    category: "quran",
    titleAr: "أَكْمِل الآية القرآنية",
    titleEn: "Complete the Verse",
    titleHe: "השלם את הפסוק הקוראני",
    promptAr: "أكمل الآية الكريمة: ﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ ______﴾",
    promptEn:
      "Complete the Verse: 'Allah! There is no deity except Him, the Ever-Living, the ______'",
    promptHe: "השלם את הפסוק: 'אללה! אין אלוה מלבדו, החי, ה______'",
    optionsAr: ["الْقَيُّومُ", "الْعَلِيمُ", "الرَّحْمَنُ", "الْحَكِيمُ"],
    optionsEn: ["Sustainer of [all] existence", "All-Knowing", "Most Compassionate", "All-Wise"],
    optionsHe: ["מקיים כל קיים (אל-קיום)", "היודע כל", "הרחמן", "החכם"],
    correctIndex: 0,
    aiExplanationAr:
      "﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾ هي بداية آية الكرسي، والقيوم هو القائم بنفسه والمقيم لجميع خلقه تدبيراً وحفظاً.",
    aiExplanationEn:
      "Ayat al-Kursi (2:255) begins with declaring Allah's unique Oneness, Eternal Life (Al-Hayy), and Self-Subsisting Sustainer of all creation (Al-Qayyum).",
    aiExplanationHe:
      "פסוק הכסא (2:255) פותח בהכרזת ייחודו של אללה, חיוניותו הנצחית (אל-חי) והיותו מקיים היקום (אל-קיום).",
    citation: "Surah Al-Baqarah (2:255)",
  },

  // 5. COMPLETE THE HADITH
  {
    id: "ch_1",
    mode: "complete_hadith",
    difficulty: "easy",
    category: "hadith",
    titleAr: "أَكْمِل الحديث النبوي",
    titleEn: "Complete the Hadith",
    titleHe: "השלם את החדית'",
    promptAr:
      "قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِـ______ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»",
    promptEn:
      "Prophet Muhammad ﷺ said: 'Actions are judged by ______ and each person will be rewarded according to what he intended.'",
    promptHe: "אמר שליח אללה ﷺ: 'המעשים אינם אלא לפי ה______ וכל איש יקבל כפי שכוון.'",
    optionsAr: ["النِّيَّاتِ", "الخَوَاتِيمِ", "القُلُوبِ", "الأَقْوَالِ"],
    optionsEn: ["Intentions (Niyyat)", "Endings", "Hearts", "Words"],
    optionsHe: ["כוונות (ניאאת)", "סופים", "לבות", "מילים"],
    correctIndex: 0,
    aiExplanationAr:
      "حديث 'إنما الأعمال بالنيات' رواه عمر بن الخطاب في صحيح البخاري، وهو أحد أركان الإسلام الثلاثة التي يدور عليها الدين، إذ يستوجب إخلاص العمل لله.",
    aiExplanationEn:
      "Narrated by Umar ibn Al-Khattab in Sahih al-Bukhari. It is a fundamental principle of Islamic jurisprudence stating that every deed is evaluated based on sincere intention.",
    aiExplanationHe:
      "מסופר על ידי עומר בן אל-ח'טאב בצחיח אל-בוח'ארי. זהו עקרון יסוד בהלכה האסלאמית לפיו כל מעשה נמדד לפי כוונה כנה.",
    citation: "Sahih al-Bukhari (Book 1, Hadith 1)",
  },

  // 6. VERSE CONTEXT (ASBAB AL-NUZUL)
  {
    id: "vc_1",
    mode: "verse_context",
    difficulty: "medium",
    category: "tafsir",
    titleAr: "سياق النزول وأسباب الآيات",
    titleEn: "Verse Context & Occasions of Revelation",
    titleHe: "הקשר הפסוק וסיבת הירידה",
    promptAr: "ما هو سبب نزول قوله تعالى: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ في سورة الإخلاص؟",
    promptEn:
      "What was the historical context / reason for revelation of ﴿Say, 'He is Allah, [who is] One'﴾ in Surah Al-Ikhlas?",
    promptHe: "מה הייתה סיבת הירידה של הפסוק ﴿אמור: הוא אללה אחד﴾ בסורת אל-איח'לאס?",
    optionsAr: [
      "سأل المشركون رسول الله ﷺ: انسب لنا ربك وصفه لنا",
      "نزلت بعد فتح مكة معلنة النصر",
      "نزلت في غزوة بدر تثبيتاً للمؤمنين",
      "نزلت ردّاً على تحويل القبلة",
    ],
    optionsEn: [
      "The polytheists asked Prophet Muhammad ﷺ: 'Describe the lineage and attributes of your Lord to us'",
      "Revealed after Conquest of Mecca celebrating victory",
      "Revealed during Battle of Badr to reassure believers",
      "Revealed in response to changing the Qibla",
    ],
    optionsHe: [
      "עובדי האלילים שאלו את הנביא מוחמד ﷺ: 'תאר לנו את ייחודו ואיכויותיו של אלוהיך'",
      "ירדה לאחר כיבוש מכה לציון הניצחון",
      "ירדה במהלך קרב בדר לעידוד המאמינים",
      "ירדה בתגובה לשינוי הכיוון (קיבלה)",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "روى الترمذي وأحمد عن أبي بن كعب أن المشركين قالوا للنبي ﷺ: يا محمد انسب لنا ربك، فأنزل الله تبارك وتعالى: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ﴾ لتنزيه الله عز وجل عن الشبيه والولد والوالد.",
    aiExplanationEn:
      "Reported by At-Tirmidhi and Ahmad: The polytheists asked the Prophet ﷺ to describe his Lord's attributes and ancestry. Allah revealed Surah Al-Ikhlas as the definitive declaration of Pure Monotheism.",
    aiExplanationHe:
      "הובא על ידי א-תרמיד'י ואחמד: עובדי האלילים ביקשו מהנביא לתאר את אלוהיו. אללה הוריד את סורת אל-איח'לאס כהצהרת ייחוד טהורה.",
    citation: "Jami` at-Tirmidhi (Hadith 3364) & Tafsir Ibn Kathir",
  },

  // 7. HADITH CONTEXT
  {
    id: "hc_1",
    mode: "hadith_context",
    difficulty: "medium",
    category: "hadith",
    titleAr: "سياق الحديث والرواد",
    titleEn: "Hadith Context & Narrators",
    titleHe: "הקשר החדית' והמספרים",
    promptAr: "من هو الصحابي الذي يُعد أكثر الصحابة روايةً للحديث النبوي الشريف بثقة وحفظ؟",
    promptEn:
      "Which Companion of the Prophet narrated the highest number of authentic Hadiths in Islamic history?",
    promptHe: "מי היה הסחאבי שסיפר את המספר הגדול ביותר של חדית'ים מאומתים בהיסטוריה האסלאמית?",
    optionsAr: [
      "أبو هريرة رضي الله عنه",
      "عبد الله بن عمر رضي الله عنهما",
      "أنس بن مالك رضي الله عنه",
      "عائشة بنت أبي بكر رضي الله عنها",
    ],
    optionsEn: [
      "Abu Hurairah (ra)",
      "Abdullah ibn Umar (ra)",
      "Anas ibn Malik (ra)",
      "Aisha bint Abi Bakr (ra)",
    ],
    optionsHe: [
      "אבו הרירה (רע)",
      "עבדאללה בן עומר (רע)",
      "אנס בן מאלכ (רע)",
      "עאישה בנת אבו בכר (רע)",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "أبو هريرة عبد الرحمن بن صخر الدوسي رضي الله عنه روى 5374 حديثاً عن النبي ﷺ، وذلك لملازمته التامة للرسول في الصفة وتفرغه الكامل للطلب والحفظ والتدوين.",
    aiExplanationEn:
      "Abu Hurairah (ra) narrated 5,374 Hadiths. His constant companionship with the Prophet ﷺ at Al-Suffah in Medina allowed him to preserve vast Prophetic knowledge.",
    aiExplanationHe:
      "אבו הרירה (רע) סיפר 5,374 חדית'ים. שהותו הרצופה לצד הנביא באל-סופה במדינה איפשרה לו לשמר ידע נרחב ביותר.",
    citation: "Siyar A'lam al-Nubala (Imam Adh-Dhahabi)",
  },

  // 8. CHRONOLOGY ORDERING MODE
  {
    id: "chr_1",
    mode: "chronology",
    difficulty: "medium",
    category: "history",
    titleAr: "ترتيب الأحداث التاريخية",
    titleEn: "Chronology of Prophetic History",
    titleHe: "סדר כרונולוגי של אירועים",
    promptAr: "رتِّب الأحداث التاريخية التالية في السيرة النبوية من الأقدم إلى الأحدث:",
    promptEn:
      "Order the following key historical events of Prophetic Seerah from earliest to latest:",
    promptHe: "סדר את האירועים ההיסטוריים הבאים ממהתרחש הראשון לאחרון:",
    chronologyItems: [
      {
        id: "c1",
        order: 1,
        textAr: "نزول الوحي في غار حراء (بدء النبوة)",
        textEn: "First revelation in Cave of Hira",
        textHe: "התגלות ראשונה במערת חיראא",
      },
      {
        id: "c2",
        order: 2,
        textAr: "حادثة الإسراء والمعراج",
        textEn: "Night Journey (Isra and Mi'raj)",
        textHe: "מסע הלילה והעלייה לשמיים (איסראא ומעראג')",
      },
      {
        id: "c3",
        order: 3,
        textAr: "الهجرة النبوية إلى المدينة المنورة",
        textEn: "The Great Hijrah to Medina",
        textHe: "ההג'רה הגדולה למדינה",
      },
      {
        id: "c4",
        order: 4,
        textAr: "غزوة بدر الكبرى",
        textEn: "The Battle of Badr",
        textHe: "קרב בדר הגדול",
      },
    ],
    aiExplanationAr:
      "الترتيب الصحيح لدايات الدعوة النبوية: 1. بدء الوحي بمكة (610م) ← 2. الإسراء والمعراج (621م) ← 3. الهجرة إلى المدينة (622م) ← 4. غزوة بدر الكبرى (2 هـ / 624م).",
    aiExplanationEn:
      "Correct Order: 1. First Revelation in Hira (610 CE) -> 2. Isra & Mi'raj (621 CE) -> 3. Hijrah to Medina (622 CE) -> 4. Battle of Badr (2 AH / 624 CE).",
    aiExplanationHe:
      "הסדר הנכון: 1. התגלות ראשונה (610) <- 2. איסראא ומעראג' (621) <- 3. הג'רה למדינה (622) <- 4. קרב בדר (624).",
    citation: "Ar-Raheeq Al-Makhtum (The Sealed Nectar)",
  },

  // 9. TRUE OR FALSE
  {
    id: "tf_1",
    mode: "true_false",
    difficulty: "easy",
    category: "quran",
    titleAr: "صواب أم خطأ",
    titleEn: "True or False",
    titleHe: "אמת או שקר",
    promptAr: "جميع سور القرآن الكريم تبدأ بـ 'بسم الله الرحمن الرحيم' باستثناء سورة التوبة.",
    promptEn:
      "All Surahs in the Quran begin with 'Bismillah-ir-Rahman-ir-Rahim' except Surah At-Tawbah.",
    promptHe: "כל סורות הקוראן פותחות ב-'בשם אללה הרחמן והרחום' פרט לסורת א-תאובה.",
    correctBoolean: true,
    aiExplanationAr:
      "عبارة صحيحة! سورة التوبة (براءة) هي السورة الوحيدة الخالية من البسملة في مطلعها لأنها نزلت بنبذ العهود للمشركين والشدة عليهم.",
    aiExplanationEn:
      "True! Surah At-Tawbah is the only chapter without Bismillah at its opening because it was revealed as a declaration of disavowal toward contract-breaking polytheists.",
    aiExplanationHe:
      "נכון! סורת א-תאובה היא היחידה ללא בסמאללה בפתחה משום שירדה כהצהרת התנערות ממוסרי עובדי האלילים.",
    citation: "Tafsir Ibn Kathir (Surah At-Tawbah)",
  },

  // 10. MULTIPLE CHOICE
  {
    id: "mc_1",
    mode: "multiple_choice",
    difficulty: "easy",
    category: "ethics",
    titleAr: "سؤال متعدد الخيارات",
    titleEn: "Multiple Choice Question",
    titleHe: "שאלה מרובת אפשרויות",
    promptAr: "ما هي أركان الإسلام الخمسة بالترتيب الشرعي كما جاءت في الحديث النبوي المشهور؟",
    promptEn: "What are the 5 Pillars of Islam according to the famous Hadith of Jibreel?",
    promptHe: "מהם חמשת עמודי האסלאם על פי חדית' גבריאל המפורסם?",
    optionsAr: [
      "الشهادتان، الصلاة، إيتاء الزكاة، صوم رمضان، وحج البيت",
      "الإيمان بالله، والملائكة، والكتب، والرسل، واليوم الآخر",
      "الصلاة، الذكر، الدعاء، البر، والصدقة",
      "القرآن، الحديث، الفقه، السيرة، والأخلاق",
    ],
    optionsEn: [
      "Shahada, Salah, Zakat, Sawm Ramadan, and Hajj",
      "Faith in Allah, Angels, Books, Messengers, Last Day",
      "Prayer, Remembrance, Supplication, Righteousness, Charity",
      "Quran, Hadith, Fiqh, Seerah, Ethics",
    ],
    optionsHe: [
      "שהאדה, צלאה (תפילה), זכאת (צדקה), צום רמדאן, וחאג' למכה",
      "אמונה באללה, במלאכים, בספרים, בשליחים וביום הדין",
      "תפילה, זכירה, בקשה, צדקה וחסד",
      "קוראן, חדית', פקה, סירה ומוסר",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "روى ابن عمر رضي الله عنهما عن النبي ﷺ: «بُني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، والحج، وصوم رمضان». (متفق عليه).",
    aiExplanationEn:
      "Reported by Ibn Umar (ra) in Sahih Bukhari & Muslim: 'Islam is built upon five pillars: Shahada, establishing prayer, paying Zakat, Hajj, and fasting Ramadan.'",
    aiExplanationHe:
      "מסופר על ידי אבן עומר בצחיח אל-בוח'ארי ומוסלים: 'האסלאם בנוי על חמישה עמודים: שהאדה, תפילה, צדקת זכאת, חאג' וצום רמדאן.'",
    citation: "Sahih al-Bukhari (Hadith 8) & Sahih Muslim (Hadith 16)",
  },

  // 11. IMAGE RECOGNITION MODE
  {
    id: "ir_1",
    mode: "image_recognition",
    difficulty: "easy",
    category: "history",
    titleAr: "التعرف البصري على المعالم الإسلامية",
    titleEn: "Islamic Landmark Recognition",
    titleHe: "זיהוי ויזואלי של אתרים קדושים",
    promptAr: "ما اسم المسجد القائم بمكة المكرمة ويتوسطه الكعبة المشرفة؟",
    promptEn: "Which sacred mosque in Mecca encloses the Holy Kaaba at its center?",
    promptHe: "מה שמו של המסגד הקדוש במכה שבמרכזו עומדת הכעבה המכובדת?",
    image:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80",
    optionsAr: ["المسجد الحرام", "المسجد النبوي", "المسجد الأقصى", "مسجد قباء"],
    optionsEn: ["Al-Masjid Al-Haram", "Al-Masjid An-Nabawi", "Al-Masjid Al-Aqsa", "Quba Mosque"],
    optionsHe: [
      "אל-מסג'ד אל-חראם (מכה)",
      "אל-מסג'ד א-נבאווי (מדינה)",
      "מסגד אל-אקצא (ירושלים)",
      "מסגד קובאא",
    ],
    correctIndex: 0,
    aiExplanationAr:
      "المسجد الحرام بمكة هو أعظم مسجد في الإسلام، وتتوسطه الكعبة المشرفة قبلة المسلمين في صلاتهم، والصلاة فيه تضاعف بمائة ألف صلاة.",
    aiExplanationEn:
      "Al-Masjid Al-Haram in Mecca is the holiest site in Islam housing the Kaaba. Praying inside it yields the reward of 100,000 prayers elsewhere.",
    aiExplanationHe:
      "אל-מסג'ד אל-חראם במכה הוא המקום הקדוש ביותר באסלאם ובו שוכנת הכעבה. תפילה בו שווה 100,000 תפילות.",
    citation: "Surah Al-Baqarah (2:144) & Sunan Ibn Majah",
  },

  // 12. RELATIONSHIP MATCHING MODE
  {
    id: "rm_1",
    mode: "relationship_matching",
    difficulty: "medium",
    category: "prophets",
    titleAr: "طابق النبي والشرائع والكتب",
    titleEn: "Match Prophets with Revealed Books",
    titleHe: "התאם בין נביאים לספרים המוזרמים",
    promptAr: "صل بين كل نبي كريم والكتاب السماوي المُنزل عليه:",
    promptEn: "Connect each Holy Prophet with their revealed Heavenly Scripture:",
    promptHe: "חבר בין כל נביא לספרו השמימי שנמסר לו:",
    matchingPairs: [
      {
        id: "m1",
        leftAr: "موسى عليه السلام",
        leftEn: "Prophet Moses",
        leftHe: "הנביا משה",
        rightAr: "التوراة",
        rightEn: "Torah",
        rightHe: "תורה",
      },
      {
        id: "m2",
        leftAr: "عيسى عليه السلام",
        leftEn: "Prophet Jesus",
        leftHe: "הנביא ישוע",
        rightAr: "الإنجيل",
        rightEn: "Gospel (Injeel)",
        rightHe: "אוונגליון (אינג'יל)",
      },
      {
        id: "m3",
        leftAr: "داوود عليه السلام",
        leftEn: "Prophet David",
        leftHe: "הנביא דוד",
        rightAr: "الزبور",
        rightEn: "Psalms (Zabur)",
        rightHe: "תהילים (זבור)",
      },
      {
        id: "m4",
        leftAr: "محمد ﷺ",
        leftEn: "Prophet Muhammad ﷺ",
        leftHe: "הנביא מוחמד ﷺ",
        rightAr: "القرآن الكريم",
        rightEn: "Holy Quran",
        rightHe: "הקוראן הקדוש",
      },
    ],
    aiExplanationAr:
      "الإيمان بالكتب السماوية هو الركن الثالث من أركان الإيمان: التوراة لموسى، الإنجيل لعيسى، الزبور لداوود، والقرآن الكريم لمحمد ﷺ خاتم الأنبياء.",
    aiExplanationEn:
      "Belief in Revealed Books is the 3rd Pillar of Iman: Torah to Moses, Gospel to Jesus, Psalms to David, and the final unchanged Quran to Muhammad ﷺ.",
    aiExplanationHe:
      "אמונה בספרים היא העמוד השלישי באמונה האסלאמית: תורה למשה, אינג'יל לישוע, תהילים לדוד והקוראן למוחמד ﷺ.",
    citation: "Surah An-Nisa (4:163) & Surah Al-Ma'idah (5:44-48)",
  },

  // 13. TOPIC MATCHING MODE
  {
    id: "tm_1",
    mode: "topic_matching",
    difficulty: "medium",
    category: "ethics",
    titleAr: "طابق المفاهيم والآيات القرآنية",
    titleEn: "Match Topics with Quranic Themes",
    titleHe: "התאם בין נושאים למוטיבים בקוראן",
    promptAr: "اربط بين الموضوع الأخلاقي والآية المحورية المتعلقة به:",
    promptEn: "Connect each ethical concept with its central Quranic declaration:",
    promptHe: "חבר בין המושג המוסרי לפסוק הקוראני המרכזי שמתייחס אליו:",
    matchingPairs: [
      {
        id: "t1",
        leftAr: "الصبر والاحتساب",
        leftEn: "Patience & Perseverance",
        leftHe: "סבלנות והתמדה",
        rightAr: "﴿إِنَّ اللَّهَ مَعَ الصَّابِرِينَ﴾",
        rightEn: "﴿Indeed, Allah is with the patient﴾",
        rightHe: "﴿אכן, אללה עם הסבלניים﴾",
      },
      {
        id: "t2",
        leftAr: "العدل والقسط",
        leftEn: "Justice & Equity",
        leftHe: "צדק ויושר",
        rightAr: "﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾",
        rightEn: "﴿Allah orders justice and good conduct﴾",
        rightHe: "﴿אללה מורה על צדק ועשיית טוב﴾",
      },
      {
        id: "t3",
        leftAr: "شكر النعم",
        leftEn: "Gratitude to Allah",
        leftHe: "הודיה על ברכות",
        rightAr: "﴿لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ﴾",
        rightEn: "﴿If you are grateful, I will surely increase you﴾",
        rightHe: "﴿אם תודו, אגדיל את שפעכם﴾",
      },
      {
        id: "t4",
        leftAr: "بر الوالدين",
        leftEn: "Filial Piety to Parents",
        leftHe: "כיבוד הורים",
        rightAr: "﴿وَبِالْوَالِدَيْنِ إِحْسَانًا﴾",
        rightEn: "﴿And to parents, good treatment﴾",
        rightHe: "﴿והתנהגות טובה להורים﴾",
      },
    ],
    aiExplanationAr:
      "تتكامل المنظومة الأخلاقية في القرآن الكريم بحيث تربط العبادة بالسلوك الإنساني الراقي من صبر وعدل وإحسان وشكر وبر بالوالدين.",
    aiExplanationEn:
      "Quranic ethics directly tie devotion to Allah with outstanding interpersonal character—patience, justice, gratitude, and kindness to parents.",
    aiExplanationHe:
      "האתיקה בקוראן מחברת בין אמונה להתנהגות מוסרית גבוהה — סבלנות, צדק, הודיה וכיבוד הורים.",
    citation: "Surah An-Nahl (16:90), Surah Ibrahim (14:7), Surah Al-Baqarah (2:153)",
  },
];
