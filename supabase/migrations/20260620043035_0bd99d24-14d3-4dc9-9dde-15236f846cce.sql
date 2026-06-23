
-- Knowledge layer foundation
CREATE TYPE public.knowledge_kind AS ENUM ('topic','prophet','story','event','place','nation','concept','theme');
CREATE TYPE public.knowledge_relation AS ENUM ('related','child_of','happened_in','involves','teaches','mentions','part_of');

CREATE TABLE public.knowledge_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.knowledge_kind NOT NULL,
  slug text NOT NULL UNIQUE,
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  keywords_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero_image text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  embedding vector(3072),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX knowledge_entities_kind_idx ON public.knowledge_entities(kind);
CREATE INDEX knowledge_entities_published_idx ON public.knowledge_entities(published);

GRANT SELECT ON public.knowledge_entities TO anon, authenticated;
GRANT ALL ON public.knowledge_entities TO service_role;
ALTER TABLE public.knowledge_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published entities" ON public.knowledge_entities
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE TABLE public.knowledge_entity_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  surah smallint NOT NULL,
  ayah_start smallint NOT NULL,
  ayah_end smallint NOT NULL,
  relevance smallint NOT NULL DEFAULT 5,
  note_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kev_entity_idx ON public.knowledge_entity_verses(entity_id);
CREATE INDEX kev_surah_idx ON public.knowledge_entity_verses(surah, ayah_start);
GRANT SELECT ON public.knowledge_entity_verses TO anon, authenticated;
GRANT ALL ON public.knowledge_entity_verses TO service_role;
ALTER TABLE public.knowledge_entity_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read entity verses" ON public.knowledge_entity_verses
  FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.knowledge_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  to_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  relation public.knowledge_relation NOT NULL DEFAULT 'related',
  weight smallint NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_id, to_id, relation)
);
CREATE INDEX kr_from_idx ON public.knowledge_relations(from_id);
CREATE INDEX kr_to_idx ON public.knowledge_relations(to_id);
GRANT SELECT ON public.knowledge_relations TO anon, authenticated;
GRANT ALL ON public.knowledge_relations TO service_role;
ALTER TABLE public.knowledge_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read relations" ON public.knowledge_relations
  FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.knowledge_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  level smallint NOT NULL DEFAULT 1,
  hero_image text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_journeys TO anon, authenticated;
GRANT ALL ON public.knowledge_journeys TO service_role;
ALTER TABLE public.knowledge_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read journeys" ON public.knowledge_journeys
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE TABLE public.knowledge_journey_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.knowledge_journeys(id) ON DELETE CASCADE,
  step_order int NOT NULL,
  entity_id uuid REFERENCES public.knowledge_entities(id) ON DELETE SET NULL,
  surah smallint,
  ayah_start smallint,
  ayah_end smallint,
  notes_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kjs_journey_idx ON public.knowledge_journey_steps(journey_id, step_order);
GRANT SELECT ON public.knowledge_journey_steps TO anon, authenticated;
GRANT ALL ON public.knowledge_journey_steps TO service_role;
ALTER TABLE public.knowledge_journey_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read journey steps" ON public.knowledge_journey_steps
  FOR SELECT TO anon, authenticated USING (true);

-- updated_at triggers
CREATE TRIGGER trg_ke_updated BEFORE UPDATE ON public.knowledge_entities
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_kj_updated BEFORE UPDATE ON public.knowledge_journeys
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed: prophets
INSERT INTO public.knowledge_entities (kind, slug, title_i18n, summary_i18n, sort_order) VALUES
('prophet','musa',
  '{"he":"משה","ar":"موسى","en":"Moses (Musa)"}',
  '{"he":"הנביא משה, שליחו של אללה לבני ישראל ופרעה.","ar":"النبي موسى عليه السلام، رسول الله إلى بني إسرائيل وفرعون.","en":"Prophet Moses, messenger of Allah to the Children of Israel and Pharaoh."}',
  1),
('prophet','ibrahim',
  '{"he":"אברהם","ar":"إبراهيم","en":"Abraham (Ibrahim)"}',
  '{"he":"אבי הנביאים, חליל אללה.","ar":"أبو الأنبياء، خليل الله.","en":"Father of the prophets, the friend of Allah."}',
  2),
('prophet','isa',
  '{"he":"ישוע","ar":"عيسى","en":"Jesus (Isa)"}',
  '{"he":"בן מרים, רוח מאללה.","ar":"ابن مريم، روح من الله.","en":"Son of Mary, a spirit from Allah."}',
  3),
('prophet','nuh',
  '{"he":"נח","ar":"نوح","en":"Noah (Nuh)"}',
  '{"he":"הנביא שבנה את התיבה.","ar":"النبي الذي بنى السفينة.","en":"The prophet who built the ark."}',
  4),
('prophet','yusuf',
  '{"he":"יוסף","ar":"يوسف","en":"Joseph (Yusuf)"}',
  '{"he":"בעל החלומות, בנו של יעקב.","ar":"صاحب الرؤيا، ابن يعقوب.","en":"The dreamer, son of Jacob."}',
  5),
('prophet','adam',
  '{"he":"אדם","ar":"آدم","en":"Adam"}',
  '{"he":"האדם הראשון והנביא הראשון.","ar":"أول البشر وأول الأنبياء.","en":"The first human and first prophet."}',
  6),
('prophet','dawud',
  '{"he":"דוד","ar":"داوود","en":"David (Dawud)"}',
  '{"he":"מלך ונביא בעל הזבור.","ar":"الملك النبي صاحب الزبور.","en":"King and prophet, given the Zabur."}',
  7),
('prophet','sulayman',
  '{"he":"שלמה","ar":"سليمان","en":"Solomon (Sulayman)"}',
  '{"he":"המלך שאללה הכפיף לו את הרוח והג''ין.","ar":"الملك الذي سخر الله له الريح والجن.","en":"The king to whom wind and jinn were subjected."}',
  8),
('prophet','muhammad',
  '{"he":"מוחמד","ar":"محمد","en":"Muhammad"}',
  '{"he":"חותם הנביאים, שליח אללה לכל העולם.","ar":"خاتم النبيين، رسول الله إلى العالمين.","en":"Seal of the prophets, messenger of Allah to all humanity."}',
  9),
('prophet','yunus',
  '{"he":"יונה","ar":"يونس","en":"Jonah (Yunus)"}',
  '{"he":"הנביא של הלוויתן.","ar":"صاحب الحوت.","en":"The prophet of the whale."}',
  10),
('prophet','ayyub',
  '{"he":"איוב","ar":"أيوب","en":"Job (Ayyub)"}',
  '{"he":"סמל הסבלנות.","ar":"رمز الصبر.","en":"The symbol of patience."}',
  11),
('prophet','yaqub',
  '{"he":"יעקב","ar":"يعقوب","en":"Jacob (Yaqub)"}',
  '{"he":"ישראל, אביו של יוסף.","ar":"إسرائيل، أبو يوسف.","en":"Israel, father of Joseph."}',
  12);

-- Seed: stories
INSERT INTO public.knowledge_entities (kind, slug, title_i18n, summary_i18n, sort_order) VALUES
('story','moses-and-pharaoh',
  '{"he":"סיפור משה ופרעה","ar":"قصة موسى وفرعون","en":"Moses and Pharaoh"}',
  '{"he":"שליחות משה לפרעה ויציאת בני ישראל ממצרים.","ar":"بعثة موسى إلى فرعون وخروج بني إسرائيل من مصر.","en":"Moses'' mission to Pharaoh and the Exodus."}',
  1),
('story','abraham-and-the-idols',
  '{"he":"אברהם והפסלים","ar":"إبراهيم والأصنام","en":"Abraham and the Idols"}',
  '{"he":"קריאתו של אברהם לייחוד והתנגדותו לעבודת אלילים.","ar":"دعوة إبراهيم للتوحيد ومواجهته للأصنام.","en":"Abraham''s call to monotheism."}',
  2),
('story','joseph-and-his-brothers',
  '{"he":"יוסף ואחיו","ar":"يوسف وإخوته","en":"Joseph and His Brothers"}',
  '{"he":"המסע מהבור למלוכה במצרים.","ar":"الرحلة من الجبّ إلى ملك مصر.","en":"From the well to power in Egypt."}',
  3),
('story','noahs-ark',
  '{"he":"תיבת נח","ar":"سفينة نوح","en":"Noah''s Ark"}',
  '{"he":"המבול וההצלה.","ar":"الطوفان والنجاة.","en":"The flood and salvation."}',
  4),
('story','mary-and-jesus',
  '{"he":"מרים ולידת ישוע","ar":"مريم وميلاد عيسى","en":"Mary and the Birth of Jesus"}',
  '{"he":"לידתו הנסית של ישוע.","ar":"الولادة المعجزة لعيسى.","en":"The miraculous birth of Jesus."}',
  5),
('story','people-of-the-cave',
  '{"he":"אנשי המערה","ar":"أصحاب الكهف","en":"People of the Cave"}',
  '{"he":"נערים שמצאו מקלט באמונתם.","ar":"فتية آمنوا بربهم فآواهم الكهف.","en":"Youths who sought refuge in faith."}',
  6),
('story','solomon-and-sheba',
  '{"he":"שלמה ומלכת שבא","ar":"سليمان وملكة سبأ","en":"Solomon and the Queen of Sheba"}',
  '{"he":"חוכמת שלמה ומלכות בלקיס.","ar":"حكمة سليمان وملكة بلقيس.","en":"Solomon''s wisdom and Bilqis."}',
  7),
('story','adam-and-iblis',
  '{"he":"אדם ואיבליס","ar":"آدم وإبليس","en":"Adam and Iblis"}',
  '{"he":"בריאת האדם וסירובו של איבליס להשתחוות.","ar":"خلق آدم ورفض إبليس السجود.","en":"Creation of Adam and Iblis''s refusal."}',
  8);

-- Seed: topics
INSERT INTO public.knowledge_entities (kind, slug, title_i18n, summary_i18n, sort_order) VALUES
('topic','faith',     '{"he":"אמונה","ar":"الإيمان","en":"Faith"}',          '{"he":"יסודות האמונה באללה.","ar":"أصول الإيمان بالله.","en":"Foundations of belief in Allah."}',1),
('topic','tawhid',    '{"he":"ייחוד","ar":"التوحيد","en":"Monotheism"}',     '{"he":"אחדות אללה.","ar":"وحدانية الله.","en":"Oneness of Allah."}',2),
('topic','prayer',    '{"he":"תפילה","ar":"الصلاة","en":"Prayer"}',          '{"he":"חשיבות התפילה היומית.","ar":"أهمية الصلاة.","en":"The importance of daily prayer."}',3),
('topic','charity',   '{"he":"צדקה","ar":"الصدقة","en":"Charity"}',          '{"he":"הוצאה בדרך אללה.","ar":"الإنفاق في سبيل الله.","en":"Spending in the way of Allah."}',4),
('topic','patience',  '{"he":"סבלנות","ar":"الصبر","en":"Patience"}',        '{"he":"סבלנות במצוקה ובציות.","ar":"الصبر في البلاء والطاعة.","en":"Patience through trials."}',5),
('topic','mercy',     '{"he":"רחמים","ar":"الرحمة","en":"Mercy"}',           '{"he":"רחמיו של אללה.","ar":"رحمة الله.","en":"The mercy of Allah."}',6),
('topic','forgiveness','{"he":"סליחה","ar":"المغفرة","en":"Forgiveness"}',   '{"he":"סליחת אללה למתחרטים.","ar":"مغفرة الله للتائبين.","en":"Forgiveness for the repentant."}',7),
('topic','justice',   '{"he":"צדק","ar":"العدل","en":"Justice"}',            '{"he":"הצדק במשפט וביחסי אדם.","ar":"العدل في الحكم والمعاملة.","en":"Justice in judgment and dealings."}',8),
('topic','family',    '{"he":"משפחה","ar":"الأسرة","en":"Family"}',          '{"he":"מקום המשפחה בקוראן.","ar":"مكانة الأسرة في القرآن.","en":"Family in the Quran."}',9),
('topic','parents',   '{"he":"כיבוד הורים","ar":"بر الوالدين","en":"Honoring Parents"}','{"he":"מצוות יחס טוב להורים.","ar":"الإحسان إلى الوالدين.","en":"Kindness to parents."}',10),
('topic','marriage',  '{"he":"נישואין","ar":"الزواج","en":"Marriage"}',      '{"he":"ההלכה והערך של הנישואין.","ar":"أحكام وقيم الزواج.","en":"The covenant of marriage."}',11),
('topic','women',     '{"he":"נשים בקוראן","ar":"النساء في القرآن","en":"Women in the Quran"}','{"he":"זכויות ומעמד.","ar":"الحقوق والمكانة.","en":"Rights and status."}',12),
('topic','knowledge', '{"he":"ידע","ar":"العلم","en":"Knowledge"}',          '{"he":"מעלת הידע.","ar":"فضل العلم.","en":"The virtue of knowledge."}',13),
('topic','repentance','{"he":"חזרה בתשובה","ar":"التوبة","en":"Repentance"}', '{"he":"שיבה לאללה.","ar":"الرجوع إلى الله.","en":"Returning to Allah."}',14),
('topic','paradise',  '{"he":"גן עדן","ar":"الجنة","en":"Paradise"}',        '{"he":"תיאור הגן.","ar":"وصف الجنة.","en":"Description of Paradise."}',15),
('topic','hell',      '{"he":"גיהינום","ar":"النار","en":"Hell"}',           '{"he":"אזהרות מהאש.","ar":"التحذير من النار.","en":"Warnings of the Fire."}',16),
('topic','death',     '{"he":"מוות","ar":"الموت","en":"Death"}',             '{"he":"החיים הזמניים והמעבר.","ar":"الحياة الدنيا والانتقال.","en":"Mortality and transition."}',17),
('topic','afterlife', '{"he":"חיי הנצח","ar":"الآخرة","en":"Afterlife"}',    '{"he":"יום הדין.","ar":"اليوم الآخر.","en":"The Day of Judgment."}',18),
('topic','ethics',    '{"he":"מוסר","ar":"الأخلاق","en":"Ethics"}',          '{"he":"מידות טובות.","ar":"مكارم الأخلاق.","en":"Noble character."}',19),
('topic','interfaith','{"he":"יחסים בין-דתיים","ar":"العلاقات بين الأديان","en":"Interfaith Relations"}','{"he":"דיאלוג עם אנשי הספר.","ar":"الحوار مع أهل الكتاب.","en":"Dialogue with People of the Book."}',20);
