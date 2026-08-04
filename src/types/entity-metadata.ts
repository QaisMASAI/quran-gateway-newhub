export interface TopicHierarchy {
  parentTopics: string[];
  childTopics: string[];
}

export interface EntityRichMetadata {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  alternativeSpellings: string[];
  arabicSynonyms: string[];
  hebrewSynonyms: string[];
  englishSynonyms: string[];
  transliterations: string[];
  pluralForms: string[];
  rootWords: string[];
  derivedWords: string[];
  relatedConcepts: string[];
  semanticTags: string[];
  topicHierarchies: TopicHierarchy;
  emotionalCategories: string[];
  jurisprudenceCategories: string[];
  theologicalCategories: string[];
  ethicsCategories: string[];
  familyCategories: string[];
  historicalCategories: string[];
  characterTraits: string[];
  virtues: string[];
  sins: string[];
  places: string[];
  people: string[];
  events: string[];
}

export interface ConceptualQueryProfile {
  rawQuery: string;
  normalizedQuery: string;
  language: "he" | "ar" | "en" | "mixed";
  primaryConcepts: string[];
  rootWords: string[];
  synonyms: {
    ar: string[];
    he: string[];
    en: string[];
  };
  transliterations: string[];
  semanticTags: string[];
  topicCategories: string[];
  theologicalCategories: string[];
  ethicsCategories: string[];
  jurisprudenceCategories: string[];
  virtues: string[];
  sins: string[];
  people: string[];
  places: string[];
  events: string[];
}
