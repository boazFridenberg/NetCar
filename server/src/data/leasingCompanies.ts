
export interface LeasingCompany {
  id: string;
  name: string;
  url: string;
  
  rateMultiplier: number;
}

export const LEASING_COMPANIES: LeasingCompany[] = [
  {
    id: 'albar',
    name: 'אלבר',
    url: 'https://www.albar.co.il/leasing/',
    rateMultiplier: 0.98,
  },
  {
    id: 'eldan',
    name: 'אלדן',
    url: 'https://www.eldan.co.il/leasing/',
    rateMultiplier: 1,
  },
  {
    id: 'tzama',
    name: 'צמה',
    url: 'https://www.tzama.co.il/',
    rateMultiplier: 1.02,
  },
  {
    id: 'sixt',
    name: 'שלמה Sixt',
    url: 'https://www.sixt.co.il/leasing/',
    rateMultiplier: 0.97,
  },
  {
    id: 'cal',
    name: 'כ.א.ל',
    url: 'https://www.cal-online.co.il/leasing/',
    rateMultiplier: 1.01,
  },
  {
    id: 'ayalon',
    name: 'איילון',
    url: 'https://www.ayalon-ins.co.il/car/leasing/',
    rateMultiplier: 0.99,
  },
];
