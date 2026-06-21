
export const MODEL_HE_TO_EN: Record<string, string> = {
  "קורולה": 'Corolla',
  "יאריס": 'Yaris',
  "קאמרי": 'Camry',
  "C-HR": 'C-HR',
  "סי-אצ'-אר": 'C-HR',
  "ראב4": 'RAV4',
  "ראב 4": 'RAV4',
  "פריוס": 'Prius',
  "אייגו": 'Aygo',
  "לנד": 'Land Cruiser',
  "אוונסיס": 'Avensis',
  "i10": 'i10',
  "i20": 'i20',
  "i30": 'i30',
  "טוסון": 'Tucson',
  "איוניק": 'Ioniq',
  "איוניק 5": 'Ioniq 5',
  "איוניק 6": 'Ioniq 6',
  "קונה": 'Kona',
  "סנטה": 'Santa Fe',
  "סנטה פה": 'Santa Fe',
  "אלנטרה": 'Elantra',
  "בלסטר": 'Bayon',
  "פיקנטו": 'Picanto',
  "ריו": 'Rio',
  "סיד": 'Ceed',
  "ספורטאז": 'Sportage',
  "ספורטז'": 'Sportage',
  "סורנטו": 'Sorento',
  "נירו": 'Niro',
  "סטוניק": 'Stonic',
  "EV6": 'EV6',
  "EV9": 'EV9',
  "מאזדה3": 'Mazda3',
  "מאזדה 3": 'Mazda3',
  "מאזדה2": 'Mazda2',
  "מאזדה 2": 'Mazda2',
  "CX-5": 'CX-5',
  "CX-30": 'CX-30',
  "CX-60": 'CX-60',
  "אוקטביה": 'Octavia',
  "פאביה": 'Fabia',
  "סקאלה": 'Scala',
  "קודיאק": 'Kodiaq',
  "קארוק": 'Karoq',
  "קאמיק": 'Kamiq',
  "אנייאק": 'Enyaq',
  "סוויפט": 'Swift',
  "ויטרה": 'Vitara',
  "אס-קרוס": 'S-Cross',
  "בלינו": 'Baleno',
  "גולף": 'Golf',
  "פולו": 'Polo',
  "פאסאט": 'Passat',
  "טיגואן": 'Tiguan',
  "טי-רוק": 'T-Roc',
  "טי-קרוס": 'T-Cross',
  "ID.3": 'ID.3',
  "ID.4": 'ID.4',
  "ID.5": 'ID.5',
  "איביזה": 'Ibiza',
  "לאון": 'Leon',
  "אטקה": 'Ateca',
  "ארונה": 'Arona',
  "קליאו": 'Clio',
  "מגאן": 'Megane',
  "קפצ'ור": 'Captur',
  "קפצור": 'Captur',
  "אוסטרל": 'Austral',
  "208": '208',
  "308": '308',
  "2008": '2008',
  "3008": '3008',
  "5008": '5008',
  "קורסה": 'Corsa',
  "אסטרה": 'Astra',
  "מוקה": 'Mokka',
  "פוקוס": 'Focus',
  "פיאסטה": 'Fiesta',
  "פומה": 'Puma',
  "קוגה": 'Kuga',
  "מוסטנג": 'Mustang',
  "X1": 'X1',
  "X3": 'X3',
  "X5": 'X5',
  "אטו 3": 'Atto 3',
  "דולפין": 'Dolphin',
  "סיל": 'Seal',
  "האן": 'Han',
  "טאנג": 'Tang',
  "מודל 3": 'Model 3',
  "מודל Y": 'Model Y',
  "מודל S": 'Model S',
  "מודל X": 'Model X',
  "ZS": 'ZS',
  "HS": 'HS',
};

const norm = (s: string): string => s.trim().replace(/\s+/g, ' ');

export function modelToEnglish(heModel: string): string {
  const key = norm(heModel);
  if (MODEL_HE_TO_EN[key]) return MODEL_HE_TO_EN[key];

  const latinOnly = key
    .replace(/\bדגם\s+\S+/gi, ' ')
    .replace(/[\u0590-\u05FF]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const latinTokens = latinOnly.match(/[A-Za-z][A-Za-z0-9-]*/g);
  if (latinTokens?.length) return latinTokens.slice(0, 2).join(' ');

  if (/[A-Za-z]/.test(key) && !/[\u0590-\u05FF]/.test(key)) return key;

  const first = key.split(' ')[0];
  if (MODEL_HE_TO_EN[first]) return MODEL_HE_TO_EN[first];

  return '';
}
