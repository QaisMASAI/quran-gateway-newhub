import { listAllEntities, type KnowledgeEntity, type LocaleCode, pickLocale } from "./knowledge";
import { EMOTIONS, type Emotion } from "./emotions";
import { TOPICS, type Topic } from "./topics";

export interface TrendingTopic {
  id: string;
  slug: string;
  kind: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  views: number;
  growth: string;
  categoryEn: string;
  categoryAr: string;
  categoryHe: string;
}

export interface TodayVerse {
  surah: number;
  ayah: number;
  surahNameAr: string;
  surahNameEn: string;
  surahNameHe: string;
  arabic: string;
  translationEn: string;
  translationAr: string;
  translationHe: string;
  tafsirSummaryEn: string;
  tafsirSummaryAr: string;
  tafsirSummaryHe: string;
  audioUrl?: string;
}

export interface TodayHadith {
  collection: string;
  hadithNum: number;
  bookEn: string;
  bookAr: string;
  bookHe: string;
  narratorEn: string;
  narratorAr: string;
  narratorHe: string;
  arabic: string;
  translationEn: string;
  translationAr: string;
  translationHe: string;
  gradeEn: string;
  gradeAr: string;
  gradeHe: string;
}

export interface TodayReflection {
  titleEn: string;
  titleAr: string;
  titleHe: string;
  summaryEn: string;
  summaryAr: string;
  summaryHe: string;
  actionItemsEn: string[];
  actionItemsAr: string[];
  actionItemsHe: string[];
  theme: string;
}

export interface ScholarOfTheWeek {
  slug: string;
  nameEn: string;
  nameAr: string;
  nameHe: string;
  era: string;
  bioEn: string;
  bioAr: string;
  bioHe: string;
  famousWorksEn: string[];
  famousWorksAr: string[];
  famousWorksHe: string[];
  keyQuoteEn: string;
  keyQuoteAr: string;
  keyQuoteHe: string;
}

export interface FeaturedStory {
  slug: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  surahRef: string;
  summaryEn: string;
  summaryAr: string;
  summaryHe: string;
  moralTakeawayEn: string;
  moralTakeawayAr: string;
  moralTakeawayHe: string;
}

export interface SacredPlaceMap {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameHe: string;
  lat: number;
  lng: number;
  locationEn: string;
  locationAr: string;
  locationHe: string;
  quranicRef: string;
  significanceEn: string;
  significanceAr: string;
  significanceHe: string;
}

export interface VirtueItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  descEn: string;
  descAr: string;
  descHe: string;
  quranicVerse: string;
  hadithRef: string;
  icon: string;
}

export interface CuratedCollection {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  descEn: string;
  descAr: string;
  descHe: string;
  badgeEn: string;
  badgeAr: string;
  badgeHe: string;
  itemsCount: number;
  topicSlugs: string[];
  colorGrad: string;
}

export interface LearningStep {
  step: number;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  type: "verse" | "hadith" | "tafsir" | "quiz" | "reflection";
  contentEn: string;
  contentAr: string;
  contentHe: string;
  targetLink: string;
  xp: number;
}

export interface TafsirSchool {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameHe: string;
  authorEn: string;
  authorAr: string;
  authorHe: string;
  methodologyEn: string;
  methodologyAr: string;
  methodologyHe: string;
  era: string;
  sampleSurah: number;
  sampleAyah: number;
}

// Deterministic index picker based on date string
function getDaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function getTrendingIslamicTopics(locale: LocaleCode): TrendingTopic[] {
  return [
    {
      id: "t1",
      slug: "sabr-and-resilience",
      kind: "topic",
      titleEn: "Patience (Sabr) & Divine Resilience",
      titleAr: "الصبر والتحمل والرضا بقضاء الله",
      titleHe: "סבלנות (צבּר) וחוסן אלוהי",
      views: 14820,
      growth: "+42%",
      categoryEn: "Virtues",
      categoryAr: "الأخلاق والسلوك",
      categoryHe: "מידות ומוסר",
    },
    {
      id: "t2",
      slug: "prophet-musa-pharaoh",
      kind: "story",
      titleEn: "Prophet Moses & Liberation from Tyranny",
      titleAr: "قصة موسى عليه السلام ومواجهة الطغيان",
      titleHe: "משה רבנו והשחרור מעול פרעה",
      views: 12950,
      growth: "+38%",
      categoryEn: "Prophetic Stories",
      categoryAr: "قصص الأنبياء",
      categoryHe: "סיפורי נביאים",
    },
    {
      id: "t3",
      slug: "tawakkul-and-peace",
      kind: "concept",
      titleEn: "Tawakkul: Complete Reliance on God",
      titleAr: "التوكل على الله والسكينة النفسية",
      titleHe: "תוקול: ביטחון מלא באל ושקט נפשי",
      views: 11400,
      growth: "+29%",
      categoryEn: "Theology",
      categoryAr: "العقيدة والقلوب",
      categoryHe: "אמונה וביטחון",
    },
    {
      id: "t4",
      slug: "al-aqsa-and-jerusalem",
      kind: "place",
      titleEn: "Al-Aqsa Mosque & Blessed Lands",
      titleAr: "المسجد الأقصى والبيت المقدس في القرآن",
      titleHe: "מסגד אל-אקצא וירושלים בקוראן",
      views: 19300,
      growth: "+55%",
      categoryEn: "Sacred Places",
      categoryAr: "الأماكن المقدسة",
      categoryHe: "מקומות קדושים",
    },
    {
      id: "t5",
      slug: "charity-zakat-barakah",
      kind: "topic",
      titleEn: "Zakat & Social Justice in Islam",
      titleAr: "الزكاة والعدالة الاجتماعية والبركة",
      titleHe: "צדקה (זכאת) וצדק חברתי באסלאם",
      views: 9800,
      growth: "+21%",
      categoryEn: "Social Ethics",
      categoryAr: "التكافل والمال",
      categoryHe: "צדק וכלכלה",
    },
  ];
}

export function getTodayVerse(locale: LocaleCode): TodayVerse {
  const verses: TodayVerse[] = [
    {
      surah: 2,
      ayah: 286,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      surahNameHe: "אל-בקרה",
      arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ",
      translationEn: "God does not burden any soul beyond its capacity. To its credit is what it earns, and against it is what it incurs.",
      translationAr: "لا يطالب الله نفسًا إلا بما تطيقه وتقدر عليه، لها ثواب ما عملت من خير، وعليها وزر ما اكتسبت من شر.",
      translationHe: "אין אללה מטיל על נפש אלא כפי יכולתה. לה מה שהרוויחה ביושר, ועליה מה שחטאה.",
      tafsirSummaryEn: "This verse provides ultimate spiritual relief, assuring believers that divine commandments are perfectly matched to human capacity.",
      tafsirSummaryAr: "ختام سورة البقرة يؤكد رحمة الله بعباده ورفع الحرج والأغلال عن هذه الأمة المرحومة.",
      tafsirSummaryHe: "פסוק מנחם זה מבטיח כי כל ניסיון ואתגר שניתנים לאדם הם בהתאם ליכולת העמידה שלו.",
    },
    {
      surah: 94,
      ayah: 5,
      surahNameAr: "الشرح",
      surahNameEn: "Ash-Sharh",
      surahNameHe: "אש-שרח",
      arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translationEn: "For indeed, with hardship will come ease. Indeed, with hardship will come ease.",
      translationAr: "فإن مع الضيق والشدة فرجًا ويسرًا، إن مع الضيق والشدة فرجًا ويسرًا.",
      translationHe: "כי אכן עם הקושי באה ההקלה. אכן עם הקושי באה ההקלה.",
      tafsirSummaryEn: "Emphasized twice for reassurance: hardship is finite while divine ease is infinite and concurrent.",
      tafsirSummaryAr: "تأكيد رباني مضاعف بأن العسر مفرد واليسر مضاعف، ولن يغلب عسر يسرين.",
      tafsirSummaryHe: "כפילות הפסוק באה לחזק את הלב כי ההקלה שלובה בתוך הקושי עצמו.",
    },
    {
      surah: 13,
      ayah: 28,
      surahNameAr: "الرعد",
      surahNameEn: "Ar-Ra'd",
      surahNameHe: "אר-רעד",
      arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translationEn: "Those who believe and whose hearts find peace in the remembrance of God. Unquestionably, by the remembrance of God do hearts find peace.",
      translationAr: "الذين صدّقوا وتسكن قلوبهم بذكر الله وطاعته، ألا بذكر الله وحده تطمئن القلوب وتسكن الأرواح.",
      translationHe: "אלה אשר האמינו ולבבם מוצא מרגוע בזיכרון אללה. הלא בזיכרון אללה מוצאים הלבבות מרגוע.",
      tafsirSummaryEn: "True tranquility and mental serenity are attained through continuous conscious connection with the Divine.",
      tafsirSummaryAr: "الطمأنينة الحقيقية والشعور بالأمان يكمنان في الاستغراق في ذكر الله وتسبيحه.",
      tafsirSummaryHe: "שקט נפשי אמיתי מתקבל כאשר האדם מחבר את מחשבתו ורוחו אל הבורא.",
    },
  ];

  const seed = getDaySeed();
  return verses[seed % verses.length];
}

export function getTodayHadith(locale: LocaleCode): TodayHadith {
  const hadiths: TodayHadith[] = [
    {
      collection: "bukhari",
      hadithNum: 1,
      bookEn: "Sahih al-Bukhari",
      bookAr: "صحيح البخاري",
      bookHe: "צחיח אל-בוח'ארי",
      narratorEn: "Omar ibn al-Khattab (RA)",
      narratorAr: "عمر بن الخطاب رضي الله عنه",
      narratorHe: "עומר בן אל-ח'טאב (רע\"א)",
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      translationEn: "Actions are judged by intentions, and every person will be rewarded according to what they intended.",
      translationAr: "إنما صلاح الأعمال وقبولها بحسب النية الصادقة، ولكل شخص أجر ما نوى.",
      translationHe: "מעשים נמדדים לפי הכוונות, וכל אדם יקבל את שכר כוונתו.",
      gradeEn: "Muttafaq 'Alayh (Authentic)",
      gradeAr: "متفق عليه (أعلى درجات الصحة)",
      gradeHe: "מוסמך ומוסכם (מוסחח)",
    },
    {
      collection: "nawawi40",
      hadithNum: 13,
      bookEn: "Forty Hadith An-Nawawi",
      bookAr: "الأربعون النووية",
      bookHe: "ארבעים החדית'ים של א-נוואווי",
      narratorEn: "Anas ibn Malik (RA)",
      narratorAr: "أنس بن مالك رضي الله عنه",
      narratorHe: "אנס בן מאלכ (רע\"א)",
      arabic: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      translationEn: "None of you truly believes until he loves for his brother what he loves for himself.",
      translationAr: "لا يكتمل إيمان أحدكم حتى يحب لأخيه في الإنسانية والإسلام ما يحبه لنفسه من الخير.",
      translationHe: "לא ישלים אדם את אמונתו עד שיאהב לאחיו את מה שהוא אוהב לעצמו.",
      gradeEn: "Sahih (Authentic)",
      gradeAr: "حديث صحيح",
      gradeHe: "חדית' מוסמך",
    },
  ];

  const seed = getDaySeed();
  return hadiths[seed % hadiths.length];
}

export function getTodayReflection(locale: LocaleCode): TodayReflection {
  return {
    titleEn: "Cultivating Inner Stillness in a Distracted World",
    titleAr: "بناء السكينة الداخلية في عصر الصخب والتشتت",
    titleHe: "טיפוח שקט פנימי בעולם של מוסחי דעת",
    summaryEn: "Reflecting on Surah Ar-Ra'd (13:28): True peace does not come from isolating oneself from difficulties, but from anchoring the heart in remembrance (Dhikr) and grateful awareness.",
    summaryAr: "تأمل في قوله تعالى: (أَلا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ). السكينة ليست غياب المشاكل، بل حضور الله في القلب أثناء مواجهة الحياة.",
    summaryHe: "התבוננות בפסוק \"הלא בזיכרון אללה מוצאים הלבבות מרגוע\": השלווה אינה היעדר קשיים, אלא נוכחות הבורא בלב בזמן ההתמודדות.",
    actionItemsEn: [
      "Take 5 minutes after morning prayer for silent gratitude and Dhikr.",
      "Identify one area of worry and consciously entrust it to God (Tawakkul).",
      "Reach out with kindness to someone undergoing hardship today.",
    ],
    actionItemsAr: [
      "خصص 5 دقائق بعد الصلاة للاستغفار والتسبيح الهادئ.",
      "حدد موضع قلق في حياتك وأعلن توكلك الكامل على الله فيه.",
      "قدم معونة أو كلمة طيبة لشخص يمر بظروف صعبة اليوم.",
    ],
    actionItemsHe: [
      "הקדש 5 דקות לאחר התפילה להכרת תודה ושבח שקט.",
      "זהה נושא המטריד אותך ושחרר אותו בביטחון מלא באל.",
      "פנה במילה טובה או עזרה לאדם העובר תקופה מורכבת.",
    ],
    theme: "Tranquility & Dhikr",
  };
}

export function getScholarOfTheWeek(locale: LocaleCode): ScholarOfTheWeek {
  return {
    slug: "imam-al-ghazali",
    nameEn: "Imam Al-Ghazali (Hujjat al-Islam)",
    nameAr: "الإمام أبو حامد الغزالي (حجة الإسلام)",
    nameHe: "האימאם אל-גזאלי (חוג'ת אל-אסלאם)",
    era: "450 - 505 AH (1058 - 1111 CE)",
    bioEn: "Master polymath, philosopher, theologian, and spiritual reformer whose works synthesized orthodox jurisprudence with deep spiritual purification (Tazkiyah).",
    bioAr: "عالم الأمة، الفلسفي والمتكلم والفقيه ومجدد القرن الخامس الهجري الذي جمع بين الفقه العميق وتزكية النفوس وسلوك طريق الآخرة.",
    bioHe: "פילוסוף, תאולוג ומשפטן דגול אשר איחד בין ההלכה היבשה לבין הטהרה הרוחנית של הלב.",
    famousWorksEn: ["Ihya Ulum al-Din (Revival of Religious Sciences)", "Tahafut al-Falasifah", "Al-Munqidh min al-Dalal"],
    famousWorksAr: ["إحياء علوم الدين", "تهافت الفلاسفة", "المنقذ من الضلال", "الوسيط في المذهب"],
    famousWorksHe: ["החייאת מדעי הדת (איחיא עולום א-דין)", "הצלת הטועים (אל-מונקז' מן אל-דלאל)"],
    keyQuoteEn: "Knowledge without action is insanity, and action without knowledge is vanity.",
    keyQuoteAr: "العلم بلا عمل جنون، والعمل بلا علم لا يكون.",
    keyQuoteHe: "ידע ללא מעשה הוא שיגעון, ומעשה ללא ידע הוא הבל.",
  };
}

export function getFeaturedStory(locale: LocaleCode): FeaturedStory {
  return {
    slug: "people-of-the-cave",
    titleEn: "The Companions of the Cave (Ashab al-Kahf)",
    titleAr: "قصة أصحاب الكهف والفتية المؤمنين",
    titleHe: "סיפור אנשי המערה (אצחאב אל-כהף)",
    surahRef: "Surah Al-Kahf (18:9-26)",
    summaryEn: "A group of faithful young believers withdrew to a mountain cave to preserve their faith against a tyrannical king. God protected them in a miraculous sleep lasting 309 lunar years.",
    summaryAr: "فتية آمنوا بربهم وزادهم الله هدى، فروا بدينهم من طغيان الملك الحاكم إلى الكهف، فأنامهم الله حمايةً لهم ثلاثمائة سنين وازدادوا تسعاً.",
    summaryHe: "צעירים מאמינים שברחו למערה כדי להגן על אמונתם מפני מלך עריץ. הבורא הישן אותם באורח פלא במשך 309 שנים.",
    moralTakeawayEn: "Stand firm in ethical truth regardless of societal pressure, knowing that divine protection transforms isolation into sanctuary.",
    moralTakeawayAr: "الثبات على الحق والعقيدة الصافية مهما بلغت الفتن المادية والاجتماعية، وأن الله يحمي عباده الصادقين.",
    moralTakeawayHe: "עמידה איתנה על האמת והמוסר גם מול לחץ חברתי, מתוך ידיעה כי ההגנה האלוהית הופכת כל מפלט למקדש.",
  };
}

export function getSacredPlacesMap(locale: LocaleCode): SacredPlaceMap[] {
  return [
    {
      id: "p1",
      slug: "makkah-kaaba",
      nameEn: "Holy Kaaba & Al-Masjid al-Haram",
      nameAr: "الكعبة المشرفة والمسجد الحرام",
      nameHe: "הכעבה והמסגד הקדוש במאכה",
      lat: 21.4225,
      lng: 39.8262,
      locationEn: "Makkah al-Mukarramah, Saudi Arabia",
      locationAr: "مكة المكرمة، المملكة العربية السعودية",
      locationHe: "מאכה אל-מוכרמה, סעודיה",
      quranicRef: "Surah Al-Baqarah (2:125, 2:144)",
      significanceEn: "The first house of monotheistic worship built by Abraham and Ishmael, Qibla for all Muslims worldwide.",
      significanceAr: "أول بيت وضع للناس لممارسة التوحيد، بناه إبراهيم وإسماعيل عليهما السلام، وقبلة المسلمين قاطبة.",
      significanceHe: "הבית הראשון שנבנה לעבודת אל אחד על ידי אברהם וישמעאל, קיבלה עבור כל המוסלמים.",
    },
    {
      id: "p2",
      slug: "madinah-prophet-mosque",
      nameEn: "Al-Masjid an-Nabawi (Prophet's Mosque)",
      nameAr: "المسجد النبوي الشريف",
      nameHe: "מסגד הנביא במדינה",
      lat: 24.4672,
      lng: 39.6112,
      locationEn: "Madinah al-Munawwarah, Saudi Arabia",
      locationAr: "المدينة المنورة، المملكة العربية السعودية",
      locationHe: "מדינה אל-מונוורה, סעודיה",
      quranicRef: "Surah At-Tawbah (9:108)",
      significanceEn: "Established by Prophet Muhammad ﷺ upon Hijrah, sanctuary of peace and Islamic statehood.",
      significanceAr: "المسجد الذي أُسس على التقوى من أول يوم، منبع الهداية والدولة الإسلامية الأولى.",
      significanceHe: "המסגד שהוקם על ידי הנביא מוחמד עם ההגירה, מרכז הרוח והקהילה.",
    },
    {
      id: "p3",
      slug: "al-aqsa-jerusalem",
      nameEn: "Al-Masjid Al-Aqsa & Dome of the Rock",
      nameAr: "المسجد الأقصى وقبة الصخرة المشرفة",
      nameHe: "מסגד אל-אקצא וכיפת הסלע",
      lat: 31.7761,
      lng: 35.2358,
      locationEn: "Jerusalem (Al-Quds), Palestine",
      locationAr: "البيت المقدس (القدس الشريف)، فلسطين",
      locationHe: "ירושלים (אל-קודס)",
      quranicRef: "Surah Al-Isra (17:1)",
      significanceEn: "The first Qibla, second house of worship built on earth, site of Night Journey (Isra and Mi'raj).",
      significanceAr: "أولى القبلتين وثالث الحرمين الشريفين ومسرى الرسول الكريم في رحلة الإسراء والمعراج المباركة.",
      significanceHe: "הקיבלה הראשונה, מקום מסע הלילה (אל-איסראא ואל-מעראג') של הנביא.",
    },
    {
      id: "p4",
      slug: "mount-sinai-tur",
      nameEn: "Mount Sinai (Jabal al-Tur)",
      nameAr: "جبل الطور ببيناء",
      nameHe: "הר סיני (ג'בל אל-טור)",
      lat: 28.5394,
      lng: 33.9753,
      locationEn: "Sinai Peninsula, Egypt",
      locationAr: "شبه جزيرة سيناء، مصر",
      locationHe: "חצי האי סיני, מצרים",
      quranicRef: "Surah At-Tin (95:2), Surah Taha (20:12)",
      significanceEn: "Sacred valley of Tuwa where God spoke directly to Prophet Moses (Musa) and revealed the Law.",
      significanceAr: "الوادي المقدس طوى حيث كلم الله موسى تكليماً وآتاه الألواح والرسالة.",
      significanceHe: "העמק הקדוש טוונה שבו דיבר הבורא ישירות עם משה רבנו.",
    },
    {
      id: "p5",
      slug: "cave-of-hira",
      nameEn: "Cave of Hira (Jabal al-Nour)",
      nameAr: "غار حراء بجبل النور",
      nameHe: "מערת חיראא (הר האור)",
      lat: 21.4578,
      lng: 39.8592,
      locationEn: "Makkah, Saudi Arabia",
      locationAr: "جبل النور، مكة المكرمة",
      locationHe: "הר האור, מאכה",
      quranicRef: "Surah Al-Alaq (96:1-5)",
      significanceEn: "The secluded cave where the first Quranic revelation descended upon Prophet Muhammad ﷺ.",
      significanceAr: "الغار المبارك الذي نزل فيه أول وحي قرآني (اقرأ باسم ربك الذي خلق).",
      significanceHe: "המערה המבודדת שבה ירדה ההתגלות הראשונה של הקוראן.",
    },
  ];
}

export function getVirtuesList(locale: LocaleCode): VirtueItem[] {
  return [
    {
      id: "v1",
      slug: "sabr",
      titleEn: "Patience & Perseverance (Sabr)",
      titleAr: "الصبر والمصابرة",
      titleHe: "סבלנות ואורך רוח (צבּר)",
      descEn: "Steadfastness of heart in times of hardship and resisting unlawful temptations.",
      descAr: "ثبات القلب عند ورود المكاره وحبس النفس عن الجزع والمعصية.",
      descHe: "עמידה איתנה בזמן מצוקה ושמירה על טהרת הלב.",
      quranicVerse: "Surah Al-Baqarah (2:153)",
      hadithRef: "Sahih Muslim #2999",
      icon: "shield",
    },
    {
      id: "v2",
      slug: "sidq",
      titleEn: "Truthfulness & Integrity (Sidq)",
      titleAr: "الصدق والاستقامة",
      titleHe: "אמת ויושר (צדק)",
      descEn: "Harmony between speech, internal intention, and outward practice.",
      descAr: "مطابقة القول للفعل والتطابق الكامل بين الباطن والظاهر.",
      descHe: "התאמה מלאה בין הדיבור, הכוונה הפנימית והמעשה.",
      quranicVerse: "Surah At-Tawbah (9:119)",
      hadithRef: "Sahih al-Bukhari #6094",
      icon: "scale",
    },
    {
      id: "v3",
      slug: "ihsan",
      titleEn: "Excellence & Beauty of Character (Ihsan)",
      titleAr: "الإحسان والإتقان",
      titleHe: "מצוינות וחסד (איחסאן)",
      descEn: "Worshipping God as though you see Him, and treating creation with beauty.",
      descAr: "أن تعبد الله كأنك تراه، وإتقان العمل وإحسان معاملة الخلق.",
      descHe: "עבודת הבורא מתוך תחושת נוכחותו, ועשיית טוב לכל אדם.",
      quranicVerse: "Surah An-Nahl (16:90)",
      hadithRef: "Sahih Muslim #8",
      icon: "sparkles",
    },
    {
      id: "v4",
      slug: "tawadu",
      titleEn: "Humility & Modesty (Tawadu)",
      titleAr: "التواضع وخفض الجناح",
      titleHe: "ענווה ושפלות רוח (תוואדע)",
      descEn: "Recognizing one's limits and treating all human beings with respect.",
      descAr: "الانقياد للحق وعدم التكبر على الناس مهما بلغت المراتب.",
      descHe: "הכרה במגבלות האדם ויחס של כבוד לכל נברא.",
      quranicVerse: "Surah Al-Furqan (25:63)",
      hadithRef: "Sahih Muslim #2588",
      icon: "heart",
    },
    {
      id: "v5",
      slug: "karam",
      titleEn: "Generosity & Selfless Giving (Karam)",
      titleAr: "الكرم والسخاء والإنفاق",
      titleHe: "נדיבות ונתינה (כרם)",
      descEn: "Sharing wealth and warmth without expecting worldly return.",
      descAr: "جود النفس بالمال والعطاء دون انتظار مقابل أو منّ.",
      descHe: "נתינה מתוך רוחב לב מבלי לצפות לתמורה גשמית.",
      quranicVerse: "Surah Al-Insan (76:8-9)",
      hadithRef: "Sahih al-Bukhari #1442",
      icon: "sun",
    },
    {
      id: "v6",
      slug: "afw",
      titleEn: "Forgiveness & Mercy ('Afw)",
      titleAr: "العفو والصفح الجميل",
      titleHe: "מחילה וסליחה (עפו)",
      descEn: "Pardoning offenses when capable of retribution and purifying grievances.",
      descAr: "التجاوز عن الإساءة مع القدرة على العقاب، وطهارة الصدر.",
      descHe: "מחילה על פגיעה מתוך יכולת לסלוח וטהרת הלב.",
      quranicVerse: "Surah Al-A'raf (7:199)",
      hadithRef: "Sunan Abu Dawud #5169",
      icon: "moon",
    },
  ];
}

export function getCuratedCollections(locale: LocaleCode): CuratedCollection[] {
  return [
    {
      id: "col-healing",
      slug: "verses-of-comfort-and-healing",
      titleEn: "Verses of Comfort, Tranquility & Healing",
      titleAr: "آيات السكينة والشفاء والطمأنينة",
      titleHe: "פסוקי נחמה, מרגוע ורפואה",
      descEn: "Curated Quranic passages specifically addressing emotional anxiety, sorrow, and spiritual restoration.",
      descAr: "مختارات قرأنية مباركة تبعث السكينة في القلوب وتزيل الهم والغم والأحزان.",
      descHe: "לקט פסוקים מנחמים להסרת דאגה, עצב וחיזוק הלב.",
      badgeEn: "Spiritual Healing",
      badgeAr: "شفاء وسكينة",
      badgeHe: "רפואת הלב",
      itemsCount: 12,
      topicSlugs: ["mercy", "patience", "anxiety"],
      colorGrad: "from-emerald-600 to-teal-800",
    },
    {
      id: "col-prophetic-duas",
      slug: "prophetic-supplications-for-peace",
      titleEn: "Prophetic Duas & Prayers for Guidance",
      titleAr: "الأدعية النبوية والقرآنية المأثورة",
      titleHe: "תפילות ובקשות של הנביאים",
      descEn: "Essential prayers made by Abraham, Moses, Jonah, and Prophet Muhammad ﷺ during decisive moments.",
      descAr: "دعوات الأنبياء الكرام في لحظات الشدة والفرج لطلب الهداية والثبات.",
      descHe: "תפילות ובקשות שנאמרו על ידי הנביאים בשעתי רצון וקושי.",
      badgeEn: "Authentic Supplications",
      badgeAr: "دعوات معتمدة",
      badgeHe: "תפילות מוסמכות",
      itemsCount: 15,
      topicSlugs: ["prayer", "tawhid"],
      colorGrad: "from-amber-600 to-orange-800",
    },
    {
      id: "col-nature-cosmos",
      slug: "miracles-of-nature-and-astronomy",
      titleEn: "Cosmic Wonders & Signs in Creation",
      titleAr: "آيات الكون والخلائق والتفكر في السماء",
      titleHe: "פלאי הבריאה והקוסמוס בקוראן",
      descEn: "Quranic verses inviting contemplation of the night sky, mountains, water cycles, and biological life.",
      descAr: "دعوة قرآنية للتفكر في خلق السماوات والأرض والدورة الحيوية للماء والأنفس.",
      descHe: "פסוקים המזמינים להתבוננות בסדרי העולם, הכוכבים והטבע.",
      badgeEn: "Contemplation (Tadabbur)",
      badgeAr: "تفكر وتدبر",
      badgeHe: "התבוננות בבריאה",
      itemsCount: 18,
      topicSlugs: ["creation", "tawhid"],
      colorGrad: "from-sky-600 to-indigo-800",
    },
    {
      id: "col-ethics-justice",
      slug: "financial-ethics-and-social-justice",
      titleEn: "Social Justice, Economics & Human Rights",
      titleAr: "العدالة الاجتماعية، المال والأخلاق الاقتصادية",
      titleHe: "צדק חברתי, כלכלה וזכויות אדם",
      descEn: "The Quranic framework on honest weight, fair trade, abolishing usury (Riba), and protecting orphans.",
      descAr: "المنظور القرآني للعدل في المعاملات، تحريم الربا، وحماية اليتامى والضعفاء.",
      descHe: "התפיסה הקוראנית למסחר הוגן, איסור ריבית והגנה על החלשים.",
      badgeEn: "Quranic Ethics",
      badgeAr: "أخلاق ومعاملات",
      badgeHe: "מוסר וצדק",
      itemsCount: 10,
      topicSlugs: ["charity", "justice"],
      colorGrad: "from-purple-600 to-slate-800",
    },
  ];
}

export function getDailyLearningJourney(locale: LocaleCode): LearningStep[] {
  return [
    {
      step: 1,
      titleEn: "Step 1: Recite Today's Key Verse",
      titleAr: "المحطة الأولى: تلاوة آية اليوم والتدبر",
      titleHe: "שלב 1: קריאת פסוק היום והתבוננות",
      type: "verse",
      contentEn: "Surah Ash-Sharh (94:5-6): 'For indeed, with hardship will come ease.' Recite with calm presence.",
      contentAr: "سورة الشرح (آية 5-6): (فَإِنَّ مَعَ الْعُسْرِ يُسْرًا). اقرأ بتأمل واستحضر الفرج الإلهي.",
      contentHe: "סורת אש-שרח (94:5-6): \"כי אכן עם הקוشي באה ההקלה\". קרא בכוונה ורוגע.",
      targetLink: "/surah/94#v-5",
      xp: 25,
    },
    {
      step: 2,
      titleEn: "Step 2: Prophetic Wisdom & Hadith Insight",
      titleAr: "المحطة الثانية: الفهم النبوي والشاهد الحديثي",
      titleHe: "שלב 2: חוכמת החדית' והנביא",
      type: "hadith",
      contentEn: "Sahih al-Bukhari #1: 'Actions are judged by intentions.' Reflect on your core motivation today.",
      contentAr: "صحيح البخاري: (إنما الأعمال بالنيات). تفحص نيتك في أعمالك اليومية وتوجه بها لله.",
      contentHe: "צחיח אל-בוח'ארי: \"מעשים נמדדים לפי הכוונות\". בחן את כוונתך הפנימית היום.",
      targetLink: "/hadith/bukhari/entry/1",
      xp: 25,
    },
    {
      step: 3,
      titleEn: "Step 3: Exegesis (Tafsir Ibn Kathir)",
      titleAr: "المحطة الثالثة: التفسير المعتمد (ابن كثير)",
      titleHe: "שלב 3: פרשנות קלאסית (תפסיר אבן כת'יר)",
      type: "tafsir",
      contentEn: "Explore classical insights on why divine ease is paired simultaneously alongside life trials.",
      contentAr: "استعرض لفتات ابن كثير التفسيرية حول اصطحاب اليسر للعسر وكيفية انقشاع الشدائد.",
      contentHe: "למד את פרשנות אבן כת'יר על החיבור בין קושי להקלה בחיי האדם.",
      targetLink: "/tafsir/94/5",
      xp: 30,
    },
    {
      step: 4,
      titleEn: "Step 4: Interactive Comprehension Quiz",
      titleAr: "المحطة الرابعة: اختبار استيعاب تفاعلي سريع",
      titleHe: "שלב 4: חידון הבנה אינטראקטיבי",
      type: "quiz",
      contentEn: "Answer a 3-question quick quiz to test your memory of today's verse and Hadith vocabulary.",
      contentAr: "أجب عن 3 أسئلة تفاعلية قصيرة لتثبيت معاني كلمات الآية والحديث الشريف.",
      contentHe: "ענה על 3 שאלות קצרות לבדיקת הבנת המילים והרעיון המרכזי.",
      targetLink: "/gamification",
      xp: 50,
    },
    {
      step: 5,
      titleEn: "Step 5: Daily Practical Reflection",
      titleAr: "المحطة الخامسة: التطبيق العملي اليومي",
      titleHe: "שלב 5: יישום מעשי יומי",
      type: "reflection",
      contentEn: "Commit to one act of generosity or patience today and write a brief personal note.",
      contentAr: "التزم بتطبيق خلق الصبر أو التكافل مع شخص قريب منك اليوم ودون ملاحظتك.",
      contentHe: "התחייב למעשה אחד של סבלנות או עזרה לזולת היום.",
      targetLink: "/notes",
      xp: 40,
    },
  ];
}

export function getTafsirSchools(locale: LocaleCode): TafsirSchool[] {
  return [
    {
      id: "taf-ibn-kathir",
      slug: "tafsir-ibn-kathir",
      nameEn: "Tafsir Ibn Kathir (Al-Qur'an al-'Azim)",
      nameAr: "تفسير القرآن العظيم للإمام ابن كثير",
      nameHe: "תפסיר אבן כת'יר (תפסיר אל-קוראן אל-עזים)",
      authorEn: "Imam Ismail ibn Kathir (d. 774 AH)",
      authorAr: "الإمام عماد الدين أبو الفداء إسماعيل بن كثير (ت 774 هـ)",
      authorHe: "האימאם אבן כת'יר (נפטר 774 להג'רה)",
      methodologyEn: "Tafsir al-Qur'an bi-l-Qur'an (Explaining Quran by Quran, Hadith, and Sahaba traditions). The most widely accepted analytical commentary.",
      methodologyAr: "التفسير بالمأثور: تفسير القرآن بالقرآن، ثم بالحديث النبوي الصحيح، ثم بأقوال الصحابة والتابعين.",
      methodologyHe: "פרשנות מבוססת מקורות: הסברת הקוראן באמצעות הקוראן עצמו, החדית' המוסמך ודברי המלווים.",
      era: "8th Century AH (Mamluk Era)",
      sampleSurah: 1,
      sampleAyah: 1,
    },
    {
      id: "taf-tabari",
      slug: "tafsir-al-tabari",
      nameEn: "Tafsir al-Tabari (Jami' al-Bayan)",
      nameAr: "جامع البيان عن تأويل آي القرآن للإمام الطبري",
      nameHe: "תפסיר אל-טברי (ג'אמע אל-ביאן)",
      authorEn: "Imam Muhammad ibn Jarir al-Tabari (d. 310 AH)",
      authorAr: "إمام المفسرين أبو جعفر محمد بن جرير الطبري (ت 310 هـ)",
      authorHe: "האימאם אל-טברי (נפטר 310 להג'רה)",
      methodologyEn: "The mother of all classical exegeses. Exhaustive chain-of-transmission (Isnad) analyses, linguistic roots, and juridical rulings.",
      methodologyAr: "أم التفاسير وأعظمها: إيراد الآثار بالأسانيد المتصلة، والترجيح بين الأقوال اللغوية والفقهية بكل دقة.",
      methodologyHe: "אם הפרשנויות הקלאסיות: ניתוח שלשלאות מסירה, שורשים לשוניים ופסיקות הלכתיות.",
      era: "3rd-4th Century AH (Abbasid Era)",
      sampleSurah: 2,
      sampleAyah: 255,
    },
    {
      id: "taf-qurtubi",
      slug: "tafsir-al-qurtubi",
      nameEn: "Tafsir al-Qurtubi (Al-Jami' li-Ahkam al-Qur'an)",
      nameAr: "الجامع لأحكام القرآن للإمام القرطبي",
      nameHe: "תפסיר אל-קורטובי (אל-ג'אמע ל-אחכאם אל-קוראן)",
      authorEn: "Imam Abu 'Abdullah al-Qurtubi (d. 671 AH)",
      authorAr: "الإمام أبو عبد الله محمد بن أحمد القرطبي (ت 671 هـ)",
      authorHe: "האימאם אל-קורטובי (נפטר 671 להג'רה)",
      methodologyEn: "Legal and juridical focus (Ahkam), synthesizing Maliki, Shafi'i, and Hanafi comparative jurisprudence alongside linguistic analysis.",
      methodologyAr: "التركيز الاستنباطي والفقهي: استخراج الأحكام والشرائع والآداب، مع تحكيم اللغة العربية وقواعد البلاغة.",
      methodologyHe: "מיקוד משפטי והלכתי: חילוץ דינים, חוקים ומוסר לצד ניתוח בלשני השוואתי.",
      era: "7th Century AH (Andalusian/Mamluk Era)",
      sampleSurah: 2,
      sampleAyah: 183,
    },
    {
      id: "taf-jalalayn",
      slug: "tafsir-al-jalalayn",
      nameEn: "Tafsir al-Jalalayn (The Two Jalals)",
      nameAr: "تفسير الجلالين (جلال الدين المحلي وجلال الدين السيوطي)",
      nameHe: "תפסיר אל-ג'לאליין (שני הג'לאלים)",
      authorEn: "Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti",
      authorAr: "جلال الدين المحلي وجلال الدين السيوطي (ت 911 هـ)",
      authorHe: "ג'לאל א-דין אל-מחלי וג'לאל א-דין א-סויוטי",
      methodologyEn: "Concise, precise, sentence-by-sentence gloss providing literal meanings and grammatical clarifications ideal for rapid study.",
      methodologyAr: "التفسير الميسر المباشر: إيجاز شديد وعبارات مركزة توضح المعنى المباشر للكلمات وإعراب الألفاظ.",
      methodologyHe: "פרשנות מתומצתת ומדויקת להבנת פירוש מילות הפסוק בצורה קלה ומהירה.",
      era: "10th Century AH (Late Medieval)",
      sampleSurah: 112,
      sampleAyah: 1,
    },
  ];
}
