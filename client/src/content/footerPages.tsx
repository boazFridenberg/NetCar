
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  Calculator,
  Cookie,
  Database,
  HelpCircle,
  Info,
  Newspaper,
  Scale,
  Shield,
  Sparkles,
} from 'lucide-react';

export type ContentPageId =
  | 'about'
  | 'how-it-works'
  | 'careers'
  | 'press'
  | 'gov-registry'
  | 'calculation-method'
  | 'help'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'data-sources';

export interface ContentSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface ContentPageDef {
  id: ContentPageId;
  badge: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  sections: ContentSection[];
  cta?: { label: string; to: string; variant?: 'primary' | 'secondary' };
}

export const CONTENT_PAGES: Record<ContentPageId, ContentPageDef> = {
  about: {
    id: 'about',
    badge: 'אודות',
    title: 'אודות NetCar',
    subtitle: 'פלטפורמה ישראלית לגילוי העלות האמיתית של רכב חדש — בנתונים, לא בניחושים.',
    icon: Info,
    sections: [
      {
        paragraphs: [
          'NetCar נולדה מתוך צורך פשוט: לפני שקונים רכב חדש, רוב הנהגים יודעים כמה עולה הרכב בחנות — אבל לא כמה יעלה להחזיק אותו בפועל לאורך השנה.',
          'אנחנו מחברים בין מאגרי מידע רשמיים של משרד התחבורה לבין מחשבון עלויות שקוף, כדי שתוכלו להשוות דגמים, לבחור בין רכישה לליסינג, ולהגיע לסוכנות הרכב מוכנים.',
        ],
      },
      {
        heading: 'מה אנחנו מציעים',
        bullets: [
          'קטלוג רכבים חדשים מדגמי 2025–2026 עם מפרט אמיתי',
          'מחשבון עלות בעלות — רכישה או ליסינג תפעולי',
          'קישורים ליבואנים ולחברות ליסינג',
          'מועדפים, השוואה ואזור אישי',
        ],
      },
      {
        heading: 'הערכים שלנו',
        bullets: [
          'שקיפות — כל מרכיבי העלות מפורטים בבירור',
          'דיוק — נתונים רשמיים מ-data.gov.il',
          'פשטות — חוויית משתמש נקייה בעברית',
        ],
      },
    ],
    cta: { label: 'גלו את הקטלוג', to: '/catalog', variant: 'primary' },
  },

  'how-it-works': {
    id: 'how-it-works',
    badge: 'מדריך',
    title: 'איך זה עובד?',
    subtitle: 'ארבעה צעדים פשוטים מחיפוש הרכב ועד להחלטה מושכלת.',
    icon: Sparkles,
    sections: [
      {
        heading: '1. חיפוש וסינון',
        paragraphs: [
          'בקטלוג או בדף הבית — חפשו לפי יצרן, דגם או שנה. אפשר גם לסנן לפי סוג מנוע ומחיר. הנתונים מגיעים ממאגר הרכבים הרשמי.',
        ],
      },
      {
        heading: '2. מפרט מלא',
        paragraphs: [
          'בעמוד הרכב תמצאו מפרט טכני, מחירון, יבואן רשמי, הערכת ליסינג וקישור לרכישה.',
        ],
      },
      {
        heading: '3. חישוב עלויות',
        paragraphs: [
          'במחשבון תבחרו רכב, קילומטראז\' שנתי וסוג החזקה (רכישה או ליסינג). תקבלו פירוט שנתי וחודשי מלא.',
        ],
      },
      {
        heading: '4. השוואה והחלטה',
        paragraphs: [
          'שמרו רכבים במועדפים, הוסיפו עד 4 דגמים להשוואה, והגיעו לסוכנות עם תמונה מלאה של העלות.',
        ],
      },
    ],
    cta: { label: 'פתחו את המחשבון', to: '/calculator', variant: 'primary' },
  },

  careers: {
    id: 'careers',
    badge: 'קריירה',
    title: 'דרושים',
    subtitle: 'בונים את הדור הבא של כלי קבלת ההחלטות לרכב בישראל.',
    icon: Briefcase,
    sections: [
      {
        paragraphs: [
          'NetCar צומחת, ואנחנו מחפשים אנשים שאוהבים מוצר, נתונים וחוויית משתמש מעולה.',
        ],
      },
      {
        heading: 'תחומים שמעניינים אותנו',
        bullets: [
          'פיתוח Full-Stack (React, Node.js, MongoDB)',
          'עיצוב מוצר ו-UX',
          'ניתוח נתונים ואינטגרציות gov.il',
          'תוכן ושיווק דיגיטלי',
        ],
      },
      {
        heading: 'איך להגיש מועמדות',
        paragraphs: [
          'שלחו קורות חיים דרך טופס יצירת הקשר. ציינו "מועמדות לעבודה" בנושא ההודעה.',
        ],
      },
    ],
    cta: { label: 'שליחת מועמדות', to: '/contact', variant: 'primary' },
  },

  press: {
    id: 'press',
    badge: 'עיתונות',
    title: 'עיתונות ומדיה',
    subtitle: 'מידע לכתבים, בלוגרים ויוצרי תוכן על NetCar.',
    icon: Newspaper,
    sections: [
      {
        paragraphs: [
          'NetCar היא פלטפורמה ישראלית שמציגה עלות בעלות אמיתית לרכבים חדשים, על בסיס נתונים פתוחים של משרד התחבורה.',
        ],
      },
      {
        heading: 'זוויות סיקור אפשריות',
        bullets: [
          'כמה באמת עולה רכב חדש מעבר למחירון?',
          'רכישה מול ליסינג — מה משתלם יותר?',
          'שקיפות נתונים ממשלתיים בצריכת ציבור',
        ],
      },
      {
        heading: 'יצירת קשר לעיתונות',
        paragraphs: ['לשאלות, ראיונות או בקשת חומרים — פנו אלינו דרך טופס יצירת הקשר.'],
      },
    ],
    cta: { label: 'יצירת קשר', to: '/contact', variant: 'secondary' },
  },

  'gov-registry': {
    id: 'gov-registry',
    badge: 'מקור רשמי',
    title: 'מאגר משרד התחבורה',
    subtitle: 'מאיפה מגיעים הנתונים ומה הם כוללים.',
    icon: Database,
    sections: [
      {
        paragraphs: [
          'NetCar נשענת על מאגרי מידע פתוחים של משרד התחבורה, שמפורסמים בפורטל data.gov.il.',
        ],
      },
      {
        heading: 'מאגרים עיקריים',
        bullets: [
          'רישום רכבים חדשים — יצרן, דגם, שנה, רמת גימור, רמת זיהום',
          'מחירון יבואנים — מחיר מחירון',
          'קטלוג WLTP — מפרט טכני מלא',
        ],
      },
      {
        heading: 'עדכון',
        paragraphs: [
          'הקטלוג ב-NetCar מסונכronet מול המאגרים. רכבים מוצגים רק משנת ייצור 2025 ו-2026.',
        ],
      },
    ],
    cta: { label: 'מקורות נתונים מלאים', to: '/data-sources', variant: 'secondary' },
  },

  'calculation-method': {
    id: 'calculation-method',
    badge: 'מתודולוגיה',
    title: 'שיטת החישוב',
    subtitle: 'איך NetCar מעריך עלות בעלות וליסינג.',
    icon: Calculator,
    sections: [
      {
        heading: 'רכישה — מרכיבי העלות',
        bullets: [
          'דלק / חשמל — לפי צריכת היצרן וקילומטראז\' שנתי',
          'אגרת רישוי — לפי סוג מנוע וקבוצת זיהום',
          'ירידת ערך — אחוז שנתי לפי סיווג הרכב',
          'ביטוח מקיף ותחזוקה — baseline לפי סיווג',
        ],
      },
      {
        heading: 'ליסינג תפעולי',
        paragraphs: [
          'במצב ליסינג אין ירידת ערך. התשלום החודשי מחושב לפי מחירון, ערך שיורי, ריבית, חבילת שירות וקילומטראז\'.',
        ],
      },
      {
        heading: 'חשוב לדעת',
        paragraphs: [
          'ההערכות לצורכי השוואה — לא הצעת מחיר מחייבת. מחירים בפועל עשויים להשתנות.',
        ],
      },
    ],
    cta: { label: 'נסו את המחשבון', to: '/calculator', variant: 'primary' },
  },

  help: {
    id: 'help',
    badge: 'עזרה',
    title: 'מרכז עזרה',
    subtitle: 'תשובות לשאלות נפוצות על השימוש ב-NetCar.',
    icon: HelpCircle,
    sections: [
      {
        heading: 'איך מחפשים רכב?',
        paragraphs: ['בקטלוג או בדף הבית — הקלידו יצרן, דגם או שנה.'],
      },
      {
        heading: 'למה חסרים נתונים בחלק מהשדות?',
        paragraphs: [
          'NetCar משלימה נתונים ממאגרי WLTP ומחירון יבואנים כשהם חסרים ברישום הבסיסי.',
        ],
      },
      {
        heading: 'האם צריך להירשם?',
        paragraphs: [
          'לא — קטלוג ומחשבון פתוחים לכולם. הרשמה נדרשת למועדפים והשוואה.',
        ],
      },
      {
        heading: 'איך מדווחים על תקלה?',
        paragraphs: ['דרך דף יצירת הקשר — בחרו "דיווח תקלה".'],
      },
    ],
    cta: { label: 'יצירת קשר', to: '/contact', variant: 'primary' },
  },

  privacy: {
    id: 'privacy',
    badge: 'משפטי',
    title: 'מדיניות פרטיות',
    subtitle: 'כיצד NetCar אוספת, משתמשת ושומרת על המידע שלכם.',
    icon: Shield,
    sections: [
      {
        heading: 'מידע שאנחנו אוספים',
        bullets: [
          'פרטי חשבון — שם, אימייל (בהרשמה)',
          'העדפות — מועדפים והשוואות',
          'פניות — תוכן הודעות מיצירת קשר',
        ],
      },
      {
        heading: 'שימוש במידע',
        bullets: ['מתן השירות', 'תמיכה ומענה לפניות', 'אבטחה ושיפור השירות'],
      },
      {
        heading: 'זכויותיכם',
        paragraphs: ['ניתן לפנות לעדכון או מחיקת חשבון דרך יצירת קשר.'],
      },
    ],
  },

  terms: {
    id: 'terms',
    badge: 'משפטי',
    title: 'תנאי שימוש',
    subtitle: 'כללי השימוש בפלטפורמת NetCar.',
    icon: Scale,
    sections: [
      {
        paragraphs: ['בשימוש באתר NetCar אתם מסכימים לתנאים אלו.'],
      },
      {
        heading: 'השירות',
        bullets: [
          'מידע והערכות לצורכי השוואה — לא ייעוץ פיננסי',
          'מחירים ומפרטים מבוססים על מקורות חיצוניים',
          'קישורים חיצוניים ליבואנים וליסינג',
        ],
      },
      {
        heading: 'חשבון משתמש',
        bullets: ['אחריות על שמירת סיסמה', 'איסור שימוש לרעה'],
      },
    ],
  },

  cookies: {
    id: 'cookies',
    badge: 'משפטי',
    title: 'מדיניות עוגיות',
    subtitle: 'שימוש בעוגיות ובטכנולוגיות דומות.',
    icon: Cookie,
    sections: [
      {
        paragraphs: ['NetCar משתמשת בעוגיות לשמירת סשן מאובטח ושיפור חוויית הגלישה.'],
      },
      {
        heading: 'סוגי עוגיות',
        bullets: [
          'הכרחיות — Refresh token (HttpOnly)',
          'פונקציונליות — Access token לבקשות API',
        ],
      },
      {
        heading: 'ניהול עוגיות',
        paragraphs: ['חסימת עוגיות הכרחיות עלולה למנוע התחברות לאזור האישי.'],
      },
    ],
  },

  'data-sources': {
    id: 'data-sources',
    badge: 'שקיפות',
    title: 'מקורות הנתונים',
    subtitle: 'רשימת המאגרים וההנחות שעליהן נשענת NetCar.',
    icon: BookOpen,
    sections: [
      {
        heading: 'מקורות gov.il',
        bullets: [
          'רישום רכבים (2025–2026)',
          'מחירון יבואנים',
          'קטלוג WLTP',
        ],
      },
      {
        heading: 'הערכות פנימיות',
        bullets: [
          'מחירי דלק, חשמל וריבית ליסינג',
          'ביטוח ותחזוקה לפי סיווג רכב',
        ],
      },
      {
        heading: 'קישורים חיצוניים',
        paragraphs: [
          'פורטל הנתונים: data.gov.il — NetCar אינה גוף ממשלתי.',
        ],
      },
    ],
    cta: { label: 'מאגר משרד התחבורה', to: '/gov-registry', variant: 'secondary' },
  },
};
