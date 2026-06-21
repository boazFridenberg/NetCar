# NetCar

פלטפורמה לחקירת **רכבים חדשים בישראל** (2025–2026): קטלוג חכם, מחשבון **עלות הבעלות מדויק**, השוואה בין דגמים, מועדפים ופאנל ניהול.

הנתונים נמשכים ממאגרי **data.gov.il** (משרד התחבורה), משולבים עם מחירוני יבואנים ומפרטים טכניים, ומועשרים בתמונות רכב.

---

## תוכן עניינים

- [יכולות עיקריות](#יכולות-עיקריות)
- [מבנה הפרויקט](#מבנה-הפרויקט)
- [טכנולוגיות](#טכנולוגיות)
- [דרישות מקדימות](#דרישות-מקדימות)
- [התקנה והרצה](#התקנה-והרצה)
- [משתני סביבה](#משתני-סביבה)
- [דפים בפרונט](#דפים-בפרונט)
- [API](#api)
- [אימות והרשאות](#אימות-והרשאות)
- [מקורות נתונים](#מקורות-נתונים)
- [פרודקשן](#פרודקשן)
- [פתרון בעיות](#פתרון-בעיות)

---

## יכולות עיקריות

| תחום | תיאור |
|------|--------|
| **קטלוג** | חיפוש, סינון ומיון רכבים לפי יצרן, דלק, מחיר, נפח מנוע ושנה |
| **פרטי רכב** | מפרט מלא, קישור ליבואן, הצעות ליסינג משוערות, תמונה |
| **מחשבון עלות** | פירוט שנתי/חודשי: דלק/חשמל, רישוי, ביטוח, פחת, תחזוקה, ליסינג |
| **השוואה** | עד 4 רכבים זה לצד זה (משתמש מחובר) |
| **מועדפים** | שמירת רכבים בדשבורד אישי |
| **משתמשים** | הרשמה, התחברות, איפוס סיסמה במייל |
| **ניהול** | סטטיסטיקות, ניהול משתמשים, הודעות צור קשר, סנכרון קטלוג |
| **UI** | עברית RTL, עיצוב responsive, אנימציית פתיחה (פעם בטאב) |

---

## מבנה הפרויקט

Monorepo עם שני אפליקציות נפרדות:

```text
NetCar/
├── client/                 # React SPA (Vite)
│   ├── public/assets/      # תמונות, Lottie, SVG
│   └── src/
│       ├── components/     # UI, layout, splash
│       ├── context/        # Auth, Toast
│       ├── pages/          # דפי האפליקציה
│       ├── services/       # קריאות API
│       └── lib/            # עזרים (apiClient, format…)
│
└── server/                 # Express REST API
    └── src/
        ├── config/         # env, קבועים
        ├── controllers/    # handlers
        ├── db/             # Mongoose models + חיבור
        ├── middleware/     # auth, rate limit, errors
        ├── repositories/   # MongoDB
        ├── routes/         # ניתוב API
        └── services/       # לוגיקה עסקית + gov.il
```

```text
┌─────────────┐     /api/* (proxy ב-dev)     ┌─────────────┐
│   Client    │ ───────────────────────────► │   Server    │
│  :5173      │     JWT + httpOnly cookie    │   :3002     │
└─────────────┘                              └──────┬──────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    ▼                               ▼                               ▼
              MongoDB Atlas                   data.gov.il                    Google/Bing CSE
           (users, vehicles, cache)         (רישום, מחירים, מפרט)              (תמונות)
```

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide, Lottie |
| Backend | Node.js 18+, Express, TypeScript, Zod |
| מסד נתונים | MongoDB (Mongoose) — Atlas או מקומי |
| אימות | JWT (access קצר + refresh ב-cookie httpOnly) |
| מייל | Nodemailer (איפוס סיסמה) |
| נתונים חיצוניים | CKAN data.gov.il, Google Custom Search, Bing Images, Wikipedia |

---

## דרישות מקדימות

- **Node.js** 18 ומעלה
- **npm** (או pnpm/yarn)
- **MongoDB** — Atlas מומלץ, או `mongodb://127.0.0.1:27017/netcar` לפיתוח מקומי
- (אופציונלי) מפתחות **Google CSE** / **Bing** לתמונות — בלי them משתמשים ב-silhouette מקומי

---

## התקנה והרצה

### 1. שרת (Backend)

```bash
cd server
cp .env.example .env
```

ערוך את `server/.env` — לפחות:

- `MONGO_URI` — חיבור ל-MongoDB
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — מחרוזות אקראיות ארוכות (שונות זו מזו)
- (אופציונלי) `GOOGLE_CSE_KEY` + `GOOGLE_CSE_CX`, SMTP לאיפוס סיסמה

```bash
npm install
npm run build    # אופציונלי — לבדיקת קומפילציה
npm run dev      # http://localhost:3002
```

בהפעלה ראשונה השרת:

1. מתחבר ל-MongoDB
2. יוצר משתמש admin (לפי `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
3. מסנכרן קטלוג מ-data.gov.il
4. מריץ סנכרון תקופתי (ברירת מחדל: כל 24 שעות)

### 2. לקוח (Frontend)

```bash
cd client
cp .env.example .env    # בדרך כלל אין צורך לשנות
npm install
npm run dev             # http://localhost:5173
```

בפיתוח, Vite מעביר בקשות `/api` לשרת ב-`3002` — כך cookie ה-refresh עובד בלי בעיות CORS.

### 3. בדיקה מהירה

| כתובת | מה לבדוק |
|--------|-----------|
| http://localhost:5173 | דף הבית + קטלוג |
| http://localhost:3002/api/health | `{ "success": true, "data": { "status": "ok" } }` |

**התחברות admin (ברירת מחדל):**  
`admin@netcar.local` / `ChangeMe!2026` — **שנה מיד ב-production.**

---

## משתני סביבה

### שרת — `server/.env`

| משתנה | חובה | תיאור |
|--------|------|--------|
| `MONGO_URI` | כן | MongoDB connection string |
| `JWT_ACCESS_SECRET` | כן | סוד ל-access token (מינימום 16 תווים) |
| `JWT_REFRESH_SECRET` | כן | סוד ל-refresh token — **שונה** מה-access |
| `PORT` | לא | ברירת מחדל `3002` |
| `CLIENT_ORIGIN` | לא | מקורות CORS (מופרדים בפסיק), ברירת מחדל `http://localhost:5173` |
| `CATALOG_SYNC_HOURS` | לא | תדירות סנכרון קטלוג בשעות (`0` = כבוי) |
| `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX` | לא | חיפוש תמונות Google |
| `BING_IMAGE_KEY` | לא | גיבוי לתמונות |
| `SMTP_*` | לא | שליחת מייל לאיפוס סיסמה; בלי SMTP — הקישור מודפס ללוג |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | לא | יצירת admin בהפעלה ראשונה |

רשימה מלאה עם ברירות מחדל: [`server/.env.example`](./server/.env.example)

### לקוח — `client/.env`

| משתנה | תיאור |
|--------|--------|
| `VITE_API_BASE_URL` | בסיס לקריאות API — ב-dev: `/api` |
| `VITE_API_PROXY_TARGET` | יעד ה-proxy של Vite — ב-dev: `http://localhost:3002` |

---

## דפים בפרונט

| נתיב | גישה | תיאור |
|------|------|--------|
| `/` | ציבורי | דף נחיתה |
| `/catalog` | ציבורי | קטלוג רכבים |
| `/vehicles/:id` | ציבורי | פרטי רכב |
| `/calculator` | ציבורי | מחשבון עלות הבעלות |
| `/contact` | ציבורי | צור קשר |
| `/login`, `/register` | ציבורי | התחברות / הרשמה |
| `/forgot-password`, `/reset-password` | ציבורי | איפוס סיסמה |
| `/dashboard` | מחובר | מועדפים |
| `/compare` | מחובר | השוואת רכבים |
| `/admin` | admin | פאנל ניהול |
| `/about`, `/privacy`, `/terms`… | ציבורי | דפי תוכן (footer) |

---

## API

בסיס: `http://localhost:3002/api`  
תגובות בפורמט: `{ success: true, data: … }` או `{ success: false, error: { code, message } }`

### בריאות וסטטיסטיקה

| Method | Route | תיאור |
|--------|-------|--------|
| GET | `/health` | בדיקת תקינות |
| GET | `/stats` | סטטיסטיקות ציבוריות (מספר רכבים וכו') |

### אימות — `/auth`

| Method | Route | תיאור |
|--------|-------|--------|
| POST | `/auth/register` | הרשמה |
| POST | `/auth/login` | התחברות → access + refresh cookie |
| POST | `/auth/refresh` | רענון access token |
| POST | `/auth/logout` | ביטול refresh |
| POST | `/auth/forgot-password` | שליחת קישור איפוס (מייל או לוג) |
| POST | `/auth/reset-password` | הגדרת סיסמה חדשה |
| GET | `/auth/me` | פרופיל משתמש מחובר |

### רכבים — `/vehicles`

| Method | Route | תיאור |
|--------|-------|--------|
| GET | `/vehicles` | רשימה עם pagination, חיפוש וסינון |
| GET | `/vehicles/filters` | ערכי סינון (יצרנים, דלקים…) |
| GET | `/vehicles/:id` | פרטי רכב |
| GET | `/vehicles/:id/image` | פתרון/עדכון URL תמונה |

**Query לדוגמה:** `?page=1&pageSize=24&make=טויוטה&fuelType=hybrid&sort=price_asc`

### מחשבון — `/calculator`

| Method | Route | תיאור |
|--------|-------|--------|
| POST | `/calculator/estimate` | חישוב עלות הבעלות לרכב + ק"מ שנתי |

### משתמש — `/me` (נדרש Authorization)

| Method | Route | תיאור |
|--------|-------|--------|
| GET/POST/DELETE | `/me/favorites/:id` | מועדפים |
| GET/POST/DELETE | `/me/comparison/:id` | רשימת השוואה (עד 4) |

### צור קשר — `/contact`

| Method | Route | תיאור |
|--------|-------|--------|
| POST | `/contact` | שליחת הודעה |

### ניהול — `/admin` (admin בלבד)

| Method | Route | תיאור |
|--------|-------|--------|
| GET | `/admin/stats` | סטטיסטיקות מערכת |
| POST | `/admin/sync` | סנכרון ידני של הקטלוג |
| GET/PATCH | `/admin/users` | ניהול משתמשים |
| GET/PATCH | `/admin/messages` | הודעות צור קשר |

---

## אימות והרשאות

1. **Login** מחזיר `accessToken` ב-JSON ו-`refreshToken` ב-**httpOnly cookie**.
2. הלקוח שולח `Authorization: Bearer <accessToken>` בבקשות מוגנות.
3. כשה-access פג, הלקוח קורא ל-`/auth/refresh` (cookie נשלח אוטומטית).
4. תפקידים: `user` | `admin` — admin נדרש ל-`/admin/*`.

---

## מקורות נתונים

| מקור | שימוש |
|------|--------|
| [data.gov.il](https://data.gov.il) — רישום רכבים | קטלוג בסיסי 2025–2026 |
| מחירון יבואנים (GOV_PRICE) | מחירי רכב |
| מפרט WLTP (GOV_SPECS) | נפח, כוח, מושבים, הנעה |
| Google CSE / Bing / Wikipedia | תמונות (נשמרות ב-MongoDB cache) |
| Silhouette מקומי | גיבוי כשאין תמונה |

---

## פרודקשן

### Build

```bash
cd server && npm run build && npm start
cd client && npm run build
```

קבצי ה-client ב-`client/dist/` — הגשה דרך CDN, Nginx, Vercel, Netlify וכו'.

### Checklist

- [ ] `NODE_ENV=production`
- [ ] סודות JWT חזקים וייחודיים
- [ ] `CLIENT_ORIGIN` מצביע לדומיין האמיתי
- [ ] MongoDB Atlas עם IP whitelist / VPC
- [ ] SMTP מוגדר לאיפוס סיסמה
- [ ] שנה `ADMIN_PASSWORD` אחרי deploy ראשון
- [ ] **אל תעלה** `server/.env` ל-Git (כבר ב-`.gitignore`)

### סקריפטים שימושיים

```bash
# שרת
npm run dev        # פיתוח עם hot reload
npm run typecheck  # בדיקת TypeScript
npm run lint       # ESLint

# לקוח
npm run dev
npm run build
npm run preview    # תצוגה מקדימה של build
npm run typecheck
```

---

## פתרון בעיות

| בעיה | פתרון |
|------|--------|
| `Invalid environment configuration` | בדוק `server/.env` — בעיקר `MONGO_URI` ו-JWT secrets |
| `EADDRINUSE :3002` | תהליך ישן תופס את הפורט — סגור אותו או שנה `PORT` |
| קטלוג ריק | המתן לסנכרון ראשון; או `POST /api/admin/sync` כ-admin |
| אין תמונות | הגדר Google CSE; בלי מפתחות — יוצג SVG ברירת מחדל |
| איפוס סיסמה לא מגיע | בדוק SMTP; ב-dev — חפש קישור בלוג השרת |
| CORS / cookie לא עובד | ודא `CLIENT_ORIGIN` תואם ל-URL של הפרונט |
| Tailwind נראה שבור | ודא ב-`tailwind.config.js`: `content: ['./index.html', './src/**/*.{ts,tsx}']` |
| אנימציית פתיחה בכל רענון | מוצגת פעם בטאב בלבד (`sessionStorage`) |

---

## רישיון

Proprietary — © NetCar. All rights reserved.
