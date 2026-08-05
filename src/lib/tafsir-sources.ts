// Client-safe metadata for approved tafsir sources used by AyahCard and Tafsir Platform.

export type TafsirSourceKey =
  | "ibn_kathir"
  | "jalalayn"
  | "sadi"
  | "qurtubi"
  | "tabari"
  | "baghawi"
  | "maariful_quran"
  | "ibn_abbas";

export interface TafsirSourceMeta {
  key: TafsirSourceKey;
  slug: string;
  apiSlugAr: string;
  apiSlugEn?: string;
  name_ar: string;
  name_en: string;
  name_he: string;
  author_ar: string;
  author_en: string;
  author_he: string;
  era: string; // e.g. "774 AH / 1373 CE"
  methodology: "bil_mathur" | "linguistic" | "fiqh" | "contemporary" | "early_tradition";
  methodologyLabel_ar: string;
  methodologyLabel_en: string;
  methodologyLabel_he: string;
  description_ar: string;
  description_en: string;
  description_he: string;
  badgeColor: string;
  scholarBio: {
    birthDeath: string;
    birthplace: string;
    keyWorks: string[];
    summary_en: string;
    summary_ar: string;
    summary_he: string;
  };
}

export const TAFSIR_SOURCES_META: TafsirSourceMeta[] = [
  {
    key: "ibn_kathir",
    slug: "ibn_kathir",
    apiSlugAr: "ar-tafsir-ibn-kathir",
    apiSlugEn: "en-tafsir-ibn-kathir",
    name_ar: "تفسير ابن كثير (القرآن العظيم)",
    name_en: "Tafsir Ibn Kathir",
    name_he: "תפסיר אבן כת׳יר",
    author_ar: "الإمام الحافظ إسماعيل بن عمر بن كثير",
    author_en: "Imam Ibn Kathir (d. 774 AH)",
    author_he: "אימאם אבן כת׳יר",
    era: "774 AH / 1373 CE",
    methodology: "bil_mathur",
    methodologyLabel_ar: "تفسير بالمأثور (الأحاديث والآثار)",
    methodologyLabel_en: "Narration-Based (Bil-Ma'thur)",
    methodologyLabel_he: "פירוש מבוסס מסורות (חדית׳)",
    description_ar:
      "أشهر تفاسير بالمأثور، يفسر القرآن بالقرآن، ثم بالحديث الشريف، ثم بأقوال الصحابة والتابعين مع النقد الحديثي.",
    description_en:
      "The most authoritative classical narration-based Tafsir. Explains Quran by Quran, authentic Hadiths, and statements of the Companions with Hadith verification.",
    description_he:
      "התפסיר הקלאסי המוסמך ביותר מבוסס המסורות. מפרש קוראן באמצעות קוראן, חדית׳ים מאומתים ואמרות הצחאבה.",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    scholarBio: {
      birthDeath: "700 – 774 AH (1300 – 1373 CE)",
      birthplace: "Busra, Syria (Damascus scholar)",
      keyWorks: ["Tafsir al-Qur'an al-Azim", "Al-Bidayah wa al-Nihayah", "Al-Ba'ith al-Hathith"],
      summary_en:
        "Imam Ibn Kathir was a master Muhaddith, historian, and Shafi'i jurist. A star student of Shaykh al-Islam Ibn Taymiyyah and Al-Mizzi.",
      summary_ar: "الإمام الحافظ عماد الدين أبو الفداء ابن كثير، محدث ومؤرخ وفقيه شافعي، تلميذ ابن تيمية والمزي.",
      summary_he: "אימאם אבן כת׳יר היה חוקר חדית׳, היסטוריון ומשפטן שאפעי בולט בדמשק, תלמידם של אבן תיימיה ואל-מזי.",
    },
  },
  {
    key: "jalalayn",
    slug: "al_jalalayn",
    apiSlugAr: "ar-tafsir-al-jalalayn",
    apiSlugEn: "en-al-jalalayn",
    name_ar: "تفسير الجلالين",
    name_en: "Tafsir Al-Jalalayn",
    name_he: "תפסיר אל-ג׳لاלין",
    author_ar: "جلال الدين المحلي وجلال الدين السيوطي",
    author_en: "Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti",
    author_he: "ג׳לאל א-דין אל-מחאלי וג׳לאל א-דין א-סיוטי",
    era: "911 AH / 1505 CE",
    methodology: "linguistic",
    methodologyLabel_ar: "وجيز لغوي ومحكم",
    methodologyLabel_en: "Concise Classical Linguistic",
    methodologyLabel_he: "פירוש לשוני מרוכז ומדויק",
    description_ar: "تفسير موجز ودقيق يركز على استخراج المعنى اللغوي المباشر، إعراب الكلمات، والقراءات المتواترة.",
    description_en:
      "Renowned classical commentary praised for extreme brevity and precision in linguistic meanings, grammar (i'rab), and variant readings.",
    description_he: "פירוש קלאסי מפורסם הידוע בתמציתיות רבה ובדיוק לשוני, דקדוק (אעראב) וקריאות שונות.",
    badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    scholarBio: {
      birthDeath: "Al-Mahalli (d. 864 AH) & Al-Suyuti (849 – 911 AH)",
      birthplace: "Cairo, Egypt",
      keyWorks: ["Tafsir al-Jalalayn", "Al-Itqan fi 'Ulum al-Qur'an", "Jam' al-Jawami'"],
      summary_en:
        "Begun by Jalal al-Din al-Mahalli (Surah Al-Kahf to An-Nas) and completed after his passing by Jalal al-Din al-Suyuti in a single month in identical style.",
      summary_ar:
        "بدأه جلال الدين المحلي من سورة الكهف إلى الناس، وأكمله جلال الدين السيوطي بعد وفاته في شهر واحد بنفس الأسلوب.",
      summary_he:
        "החל על ידי ג׳לאל א-דיن אל-מחאלי והושלם לאחר מותו על ידי ג׳לאל א-דין א-סיוטי בתוך חודש אחד באותו סגנון.",
    },
  },
  {
    key: "sadi",
    slug: "sadi",
    apiSlugAr: "ar-tafsir-al-saddi",
    name_ar: "تفسير السعدي (تيسير الكريم الرحمن)",
    name_en: "Tafsir Al-Sa'di",
    name_he: "תפסיר אס-סעדי",
    author_ar: "الشيخ عبد الرحمن بن ناصر السعدي",
    author_en: "Shaykh Abd al-Rahman al-Sa'di (d. 1376 AH)",
    author_he: "שייח׳ עבד אל-רחמן אס-סעדי",
    era: "1376 AH / 1956 CE",
    methodology: "contemporary",
    methodologyLabel_ar: "تربوي ودعوي معاصر",
    methodologyLabel_en: "Contemporary Practical & Spiritual",
    methodologyLabel_he: "פירוש יישומי ורוחני בן זמננו",
    description_ar: "تفسير معاصر يتميز بسهولة العبارة، والتركيز على المقاصد الإيمانية، التوجيهات الأخلاقية والتربوية.",
    description_en:
      "Accessible modern commentary celebrated for clear prose, practical spiritual lessons, and focus on divine wisdom and moral guidance.",
    description_he: "פירוש מודרני נגיש המתאפיין בשפה ברורה, דגש על מוסר, חכמה אלוהית והדרכה מעשית לחיים.",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    scholarBio: {
      birthDeath: "1307 – 1376 AH (1889 – 1956 CE)",
      birthplace: "Unaizah, Al-Qassim, Saudi Arabia",
      keyWorks: ["Taysir al-Karim al-Rahman", "Manhaj al-Salikin", "Al-Qawa'id al-Fiqhiyyah"],
      summary_en:
        "Shaykh Al-Sa'di was a prominent contemporary scholar and teacher of Shaykh Ibn Uthaymeen, known for gentle demeanor and deep Quranic insight.",
      summary_ar: "العلامة الشيخ عبد الرحمن السعدي، شيخ ابن عثيمين، تميز بالسماحة والعمق التفسيري والأسلوب التربوي.",
      summary_he: "שייח׳ אס-סעדי היה חוקר מודרני דגול ומורו של שייח׳ אבן עות׳יימין, אשר נודע בגישתו החינוכית והרוחנית.",
    },
  },
  {
    key: "qurtubi",
    slug: "qurtubi",
    apiSlugAr: "ar-tafsir-al-qurtubi",
    name_ar: "تفسير القرطبي (الجامع لأحكام القرآن)",
    name_en: "Tafsir Al-Qurtubi",
    name_he: "תפסיר אל-קורטובי",
    author_ar: "الإمام أبو عبد الله القرطبي",
    author_en: "Imam Al-Qurtubi (d. 671 AH)",
    author_he: "אימאם אל-קורטוبي",
    era: "671 AH / 1273 CE",
    methodology: "fiqh",
    methodologyLabel_ar: "فقهي وأحكام شرعية ولغوية",
    methodologyLabel_en: "Juristic Rulings & Fiqh (Al-Ahkam)",
    methodologyLabel_he: "פסיקה הלכתית וניתוח משפטי (פקה)",
    description_ar:
      "الموسوعة الفقهية الكبرى في تفسير القرآن، يستنبط الأحكام الفقهية ومذاهب العلماء مع بيان اللغة والعروبة والحديث.",
    description_en:
      "The premiere monumental juristic Tafsir. Extracts Fiqh rulings, comparative legal schools, Arabic grammar, poetry, and Hadith evidence.",
    description_he:
      "האנציקלופדיה המשפטית הגדולה של תפסיר הקוראן. מסיק פסיקות הלכתיות, משווה בין אסכולות משפט, דקדוק ושירה ערבית.",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    scholarBio: {
      birthDeath: "600 – 671 AH (1204 – 1273 CE)",
      birthplace: "Cordoba (Al-Andalus) / Minya, Egypt",
      keyWorks: ["Al-Jami' li-Ahkam al-Qur'an", "Al-Tadhkirah fi Ahwal al-Mawta", "Al-Asna fi Sharh Asma' Allah"],
      summary_en:
        "Imam Abu 'Abd Allah Al-Qurtubi was an Andalusian Maliki scholar and ascetic who migrated to Egypt. Famous for objective scholarly integrity.",
      summary_ar: "الإمام القرطبي الأندلسي المالكي، عالم زاهد هاجر إلى مصر، اشتهر بالموضوعية والإنصاف والتحقيق الفقهي.",
      summary_he: "אימאם אל-קורטובי היה מלומד אנדלוסי מאסכולת מאלכי שעבר למצרים, ונודע ביושר מדעי עמוק ובאובייקטיביות.",
    },
  },
  {
    key: "tabari",
    slug: "tabari",
    apiSlugAr: "ar-tafsir-al-tabari",
    name_ar: "تفسير الطبري (جامع البيان)",
    name_en: "Tafsir Al-Tabari",
    name_he: "תפסיר אל-טברי",
    author_ar: "الإمام محمد بن جرير الطبري",
    author_en: "Imam Muhammad ibn Jarir al-Tabari (d. 310 AH)",
    author_he: "אימאם איבן ג׳ריר אל-טברי",
    era: "310 AH / 923 CE",
    methodology: "bil_mathur",
    methodologyLabel_ar: "أم التفاسير بالمأثور والأسانيد",
    methodologyLabel_en: "Foundational Mother of Narration Tafsir",
    methodologyLabel_he: "אם כל התפסירים מבוססי המסורת",
    description_ar:
      "أم التفاسير وأعظمها، يورد الأسانيد الكاملة للصحابة والتابعين، ويوجه الأقوال بالترجيح اللغوي والفقهي المحكم.",
    description_en:
      "The greatest foundational encyclopedia of Tafsir. Preserves full Isnads from Companions and Successors with authoritative scholarly weightings.",
    description_he: "האנציקלופדיה המייסדת הגדולה ביותר של תפסיר הקוראן. משמרת שרשראות תמסורת מלאות מראשית האסלאם.",
    badgeColor: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200 border-emerald-600/30",
    scholarBio: {
      birthDeath: "224 – 310 AH (839 – 923 CE)",
      birthplace: "Amol, Tabaristan (Baghdad scholar)",
      keyWorks: ["Jami' al-Bayan 'an Ta'wil Ay al-Qur'an", "Tarikh al-Rusul wa al-Muluk", "Tahdhib al-Athar"],
      summary_en:
        "Imam Al-Tabari was a Mujtahid Mutlaq (independent legal authority), master of Hadith, Arabic linguistics, and father of Islamic history.",
      summary_ar: "إمام المفسرين والمؤرخين، مجتهد مطلق، جمع بين علوم الحديث والفقه واللغة والتاريخ بشكل غير مسبوق.",
      summary_he:
        "אבי ההיستוריונים והפרשנים באסלאם, פוסק עצמאי (מוג׳תהד מולאק) שאיחד ידע עצום בחדית׳, דקדוק והיסטוריה.",
    },
  },
  {
    key: "baghawi",
    slug: "baghawi",
    apiSlugAr: "ar-tafsir-al-baghawi",
    name_ar: "تفسير البغوي (معالم التنزيل)",
    name_en: "Tafsir Al-Baghawi",
    name_he: "תפסיר אל-בגהווי",
    author_ar: "الإمام الحسين بن مسعود البغوي",
    author_en: "Imam Al-Baghawi (d. 516 AH)",
    author_he: "אימאם אל-בגהווי",
    era: "516 AH / 1122 CE",
    methodology: "bil_mathur",
    methodologyLabel_ar: "مأثور منقى وسنة مطهرة",
    methodologyLabel_en: "Purified Narration & Sunnah-Centric",
    methodologyLabel_he: "מסורות מבוססות סונה מאומתות",
    description_ar:
      "تفسير متوسط بالمأثور يُعنى بالحديث الصحيح، واجتناب الإسرائيليات الضعيفة، مع بيان أحكام الفقه واللغة.",
    description_en:
      "A refined narration-based Tafsir praised for summarizing Al-Tabari while filtering weak reports, focusing on authentic Sunnah and Fiqh.",
    description_he: "תפסיר מבוסס מסורת המורעף בשבחים על זיקוק המסורות והתמקדות בסונה מאומתת ללא מסורות חלשות.",
    badgeColor: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
    scholarBio: {
      birthDeath: "433 – 516 AH (1041 – 1122 CE)",
      birthplace: "Bagh, Khurasan (Herat / Afghanistan)",
      keyWorks: ["Ma'alim al-Tanzil", "Sharh al-Sunnah", "Masabih al-Sunnah"],
      summary_en:
        "Known as 'Rukn al-Din' (Pillar of Religion) and 'Muhyi al-Sunnah' (Reviver of the Sunnah). Highly commended by Imam Ibn Taymiyyah.",
      summary_ar:
        "محيي السنة، ركن الدين البغوي، الإمام المحدث الفقيه الشافعي الذي حظي تفسيره بثناء كبير من أئمة الإسلام.",
      summary_he: "אימאם אל-בגהווי נודע כ׳מחיה הסונה׳. תפסיר זה זכה לשבחים כבירים מגדולי חכמי האסלאם.",
    },
  },
  {
    key: "maariful_quran",
    slug: "maariful_quran",
    apiSlugEn: "en-tafsir-maarif-ul-quran",
    apiSlugAr: "ar-tafsir-ibn-kathir",
    name_ar: "معارف القرآن (مفتي محمد شفيع)",
    name_en: "Ma'ariful Qur'an",
    name_he: "מעארף אל-קוראן",
    author_ar: "المفتي محمد شيع العثماني",
    author_en: "Mufti Muhammad Shafi (d. 1396 AH)",
    author_he: "מופטי מוחמד שאפי",
    era: "1396 AH / 1976 CE",
    methodology: "contemporary",
    methodologyLabel_ar: "معاصر شامل ومقاصدي",
    methodologyLabel_en: "Comprehensive Modern & Contemporary",
    methodologyLabel_he: "פירוש מקיף ומודרני למאה ה-20",
    description_ar:
      "تفسير حديث موسع وميسر يربط هداية القرآن بقضايا العصر، مع استيعاب كلام المتقدمين بطريقة علمية وسلسة.",
    description_en:
      "Comprehensive 8-volume modern commentary bridging classical consensus with modern legal, social, and personal life applications.",
    description_he: "פירוש מקיף ומודרני בן 8 כרכים המחבר בין הפרשנות הקלאסית לבין אתגרי החיים, החוק והחברה בימינו.",
    badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    scholarBio: {
      birthDeath: "1314 – 1396 AH (1897 – 1976 CE)",
      birthplace: "Deoband, India / Karachi, Pakistan",
      keyWorks: ["Ma'ariful Qur'an", "Ahkam al-Qur'an", "Jawahir al-Fiqh"],
      summary_en:
        "Grand Mufti of Pakistan, founder of Jamia Darul Uloom Karachi, leading Hanafi jurist and student of Anwar Shah Kashmiri.",
      summary_ar: "مفتي ديار باكستان الأكبر، مؤسس دار العلوم كراتشي، من كبار فقهاء الحنفية والمفسرين المعاصرين.",
      summary_he: "המופטי הגדול של פקיסטן ומייסד מוסד דאר אל-עולום קראצ׳י, חוקר חנפי ומשפטן דגול.",
    },
  },
  {
    key: "ibn_abbas",
    slug: "ibn_abbas",
    apiSlugAr: "ar-tafsir-al-jalalayn",
    name_ar: "تفسير ابن عباس (تنوير المقباس)",
    name_en: "Tanwir al-Miqbas (Ibn 'Abbas)",
    name_he: "תפסיר אבן עבאס",
    author_ar: "عبد الله بن عباس (ترجمان القرآن)",
    author_en: "Attributed to Abdullah ibn 'Abbas (d. 68 AH)",
    author_he: "מיוחס לעבדאללה אבן עבאس",
    era: "68 AH / 687 CE (Early Companion Era)",
    methodology: "early_tradition",
    methodologyLabel_ar: "تراث الصحابة الأوائل",
    methodologyLabel_en: "Early Companion Tradition",
    methodologyLabel_he: "מסורת צחאבה מוקדמת",
    description_ar: "تفسير تنوير المقباس المنسوب لترجمان القرآن الصحابي الجليل عبد الله بن عباس رضي الله عنهما.",
    description_en:
      "Early attribution to Abdullah ibn 'Abbas, the 'Interpreter of the Quran' blessed by the Prophet (PBUH) with deep Quranic understanding.",
    description_he: "פירוש מוקדם המיוחס לעבדאללה אבן עבאס, ׳פרשן הקוראן׳ אשר בורך על ידי הנביא בהבנה עמוקה של הספר.",
    badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    scholarBio: {
      birthDeath: "3 BH – 68 AH (619 – 687 CE)",
      birthplace: "Makkah / Ta'if",
      keyWorks: ["Attributed traditions in Tafsir", "Fatawa Ibn Abbas"],
      summary_en:
        "Cousin of Prophet Muhammad (PBUH), known as 'Turjuman al-Qur'an' (Interpreter of the Quran) and 'Al-Habr' (The Scholar of the Ummah).",
      summary_ar: "حبر الأمة وترجمان القرآن، ابن عم رسول الله ﷺ، دعا له النبي بالفقه في الدين وتأويل الكتاب.",
      summary_he: "בן דודו של הנביא מוחמד, נודע כ׳פרשן הקוראן׳ וכימאם הראשון של חכمي הקוראן.",
    },
  },
];

export function getTafsirMetaByKey(key: string): TafsirSourceMeta | undefined {
  return TAFSIR_SOURCES_META.find((s) => s.key === key || s.slug === key);
}

export function tafsirSourceName(
  meta: { name_he: string; name_ar: string; name_en?: string },
  locale: "he" | "ar" | "en",
): string {
  if (locale === "ar") return meta.name_ar;
  if (locale === "en") return meta.name_en ?? meta.name_he;
  return meta.name_he;
}
