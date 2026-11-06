export type KsaCity = {
  slug: string;
  ar: string;
  en: string;
  fee: number;
};

export const KSA_CITIES: KsaCity[] = [
  { slug: "riyadh", ar: "الرياض", en: "Riyadh", fee: 20 },
  { slug: "kharj", ar: "الخرج", en: "Al Kharj", fee: 20 },
  { slug: "jeddah", ar: "جدة", en: "Jeddah", fee: 25 },
  { slug: "makkah", ar: "مكة المكرمة", en: "Makkah", fee: 25 },
  { slug: "dammam", ar: "الدمام", en: "Dammam", fee: 25 },
  { slug: "khobar", ar: "الخبر", en: "Khobar", fee: 25 },
  { slug: "dhahran", ar: "الظهران", en: "Dhahran", fee: 25 },
  { slug: "qatif", ar: "القطيف", en: "Qatif", fee: 25 },
  { slug: "madinah", ar: "المدينة المنورة", en: "Madinah", fee: 30 },
  { slug: "taif", ar: "الطائف", en: "Taif", fee: 35 },
  { slug: "buraidah", ar: "بريدة", en: "Buraidah", fee: 35 },
  { slug: "ahsa", ar: "الأحساء", en: "Al Ahsa", fee: 35 },
  { slug: "yanbu", ar: "ينبع", en: "Yanbu", fee: 40 },
  { slug: "abha", ar: "أبها", en: "Abha", fee: 40 },
  { slug: "tabuk", ar: "تبوك", en: "Tabuk", fee: 40 },
  { slug: "hail", ar: "حائل", en: "Hail", fee: 40 },
  { slug: "najran", ar: "نجران", en: "Najran", fee: 45 },
  { slug: "jazan", ar: "جازان", en: "Jazan", fee: 45 },
];

export function getKsaCity(slug: string): KsaCity | undefined {
  return KSA_CITIES.find((city) => city.slug === slug?.toLowerCase());
}
