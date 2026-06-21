
export interface ImporterLink {
  name: string;
  url: string;
}

export const IMPORTER_URL_BY_CODE: Record<number, string> = {
  1: 'https://www.carasso.co.il',
  101: 'https://www.carasso.co.il',
  2: 'https://www.peugeot.co.il',
  102: 'https://www.peugeot.co.il',
  3: 'https://www.landrover.co.il',
  4: 'https://www.talcar.co.il',
  5: 'https://www.subaru.co.il',
  6: 'https://www.jaguar.co.il',
  7: 'https://www.meir-honda.co.il',
  8: 'https://www.universal-motors.co.il',
  10: 'https://www.championmotors.co.il',
  14: 'https://www.suzuki.co.il',
  15: 'https://www.kamor.co.il',
  25: 'https://www.smlt.co.il',
  27: 'https://www.colmobil.co.il',
  28: 'https://www.toyota.co.il',
  29: 'https://www.skoda.co.il',
  30: 'https://www.mazda.co.il',
  37: 'https://www.colmobil.co.il',
  40: 'https://www.nissan.co.il',
  61: 'https://www.mercedes-benz.co.il',
  62: 'https://www.paramount.co.il',
  85: 'https://www.smlt.co.il',
};

export const MAKE_IMPORTER_FALLBACK: Record<string, ImporterLink> = {
  יונדאי: { name: 'כלמוביל', url: 'https://www.colmobil.co.il' },
  טויוטה: { name: 'יוניון מוטורס', url: 'https://www.toyota.co.il' },
  לקסוס: { name: 'יוניון מוטורס', url: 'https://www.lexus.co.il' },
  קיה: { name: 'סמלת מוטורס', url: 'https://www.smlt.co.il' },
  מאזדה: { name: 'דלק מוטורס', url: 'https://www.mazda.co.il' },
  סקודה: { name: 'סקו-קאר', url: 'https://www.skoda.co.il' },
  סוזוקי: { name: 'מכשירי תנועה', url: 'https://www.suzuki.co.il' },
  מיצובישי: { name: 'כלמוביל', url: 'https://www.colmobil.co.il' },
  ניסאן: { name: 'פסיפיק', url: 'https://www.nissan.co.il' },
  הונדה: { name: 'מאיר', url: 'https://www.meir-honda.co.il' },
  פולקסווגן: { name: "צ'מפיון מוטורס", url: 'https://www.championmotors.co.il' },
  'פולקס וואגן': { name: "צ'מפיון מוטורס", url: 'https://www.championmotors.co.il' },
  רנו: { name: 'קרסו מוטורס', url: 'https://www.carasso.co.il' },
  "פיג'ו": { name: 'דוד לובינסקי', url: 'https://www.peugeot.co.il' },
  פיגו: { name: 'דוד לובינסקי', url: 'https://www.peugeot.co.il' },
  סיטרואן: { name: 'קרסו מוטורס', url: 'https://www.carasso.co.il' },
  אופל: { name: 'קרסו מוטורס', url: 'https://www.carasso.co.il' },
  'ב.מ.וו': { name: 'קמור', url: 'https://www.kamor.co.il' },
  במוו: { name: 'קמור', url: 'https://www.kamor.co.il' },
  'מרצדס בנץ': { name: 'כלמוביל', url: 'https://www.mercedes-benz.co.il' },
  מרצדס: { name: 'כלמוביל', url: 'https://www.mercedes-benz.co.il' },
  אאודי: { name: "צ'מפיון מוטורס", url: 'https://www.audi.co.il' },
  וולוו: { name: 'פארמונט מוטורס', url: 'https://www.volvo.co.il' },
  יגואר: { name: 'חברה ישראלית לאוטומובילים', url: 'https://www.jaguar.co.il' },
  'לנד רובר': { name: 'חברה ישראלית לאוטומובילים', url: 'https://www.landrover.co.il' },
  סובארו: { name: 'יפנאוטו', url: 'https://www.subaru.co.il' },
  פורשה: { name: 'קמור', url: 'https://www.porsche.co.il' },
  טסלה: { name: 'טסלה ישראל', url: 'https://www.tesla.com/he_il' },
  מיני: { name: 'קמור', url: 'https://www.mini.co.il' },
  גיפ: { name: 'יוניברסל מוטורס', url: 'https://www.jeep.co.il' },
  "בי.וי.די": { name: 'Frisbee', url: 'https://www.bydauto.co.il' },
  "בי וי די": { name: 'Frisbee', url: 'https://www.bydauto.co.il' },
  "אם.ג'י": { name: 'סמלת מוטורס', url: 'https://www.mg.co.il' },
  "אם ג'י": { name: 'סמלת מוטורס', url: 'https://www.mg.co.il' },
  "צ'רי": { name: 'Frisbee', url: 'https://www.frisbee.co.il' },
};

export function resolveImporterWebsite(code: number | null, name: string): string | null {
  if (code !== null && IMPORTER_URL_BY_CODE[code]) {
    return IMPORTER_URL_BY_CODE[code];
  }
  const normalized = name.trim().toLowerCase();
  for (const [codeKey, url] of Object.entries(IMPORTER_URL_BY_CODE)) {
    const known = importerNameForCode(Number(codeKey));
    if (known && normalized.includes(known.toLowerCase().slice(0, 4))) {
      return url;
    }
  }
  return null;
}

function importerNameForCode(code: number): string | null {
  const names: Record<number, string> = {
    37: 'כלמוביל',
    28: 'יוניון',
    30: 'דלק',
    1: 'קרסו',
    10: 'צ\'מפיון',
    15: 'קמור',
    40: 'פסיפיק',
  };
  return names[code] ?? null;
}

export function resolveMakeImporterFallback(heMake: string): ImporterLink | null {
  const first = heMake.trim().split(/\s+/)[0] ?? '';
  return MAKE_IMPORTER_FALLBACK[first] ?? null;
}
