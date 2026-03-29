export const brandOptions = [
  "Toyota",
  "Hyundai",
  "Kia",
  "Chevrolet",
  "Nissan",
  "Suzuki",
  "Mazda",
  "Ford",
  "Volkswagen",
  "Peugeot",
  "Renault",
  "Mitsubishi",
  "Subaru",
  "Honda",
  "Chery",
] as const;

export const motorOptions = ["1.0", "1.2", "1.4", "1.5", "1.6", "1.8", "2.0", "2.2", "2.4", "2.8", "3.0"] as const;

export const modelOptionsByBrand: Record<string, string[]> = {
  toyota: ["Yaris", "Corolla", "RAV4", "Hilux", "Avensis", "Rush"],
  hyundai: ["Accent", "Elantra", "i10", "i20", "Tucson", "Santa Fe"],
  kia: ["Rio", "Morning", "Cerato", "Sportage", "Sorento", "Soluto"],
  chevrolet: ["Spark", "Sail", "Onix", "Cruze", "Tracker", "Captiva"],
  nissan: ["Versa", "V16", "March", "Sentra", "Qashqai", "Navara"],
  suzuki: ["Swift", "Baleno", "Dzire", "Vitara", "S-Cross", "Jimny"],
  mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-5", "BT-50"],
  ford: ["Fiesta", "Focus", "EcoSport", "Ranger", "Escape", "Explorer"],
  volkswagen: ["Gol", "Polo", "Virtus", "Bora", "Tiguan", "Amarok"],
  peugeot: ["208", "2008", "301", "308", "3008", "Partner"],
  renault: ["Kwid", "Logan", "Sandero", "Duster", "Oroch", "Captur"],
  mitsubishi: ["Lancer", "ASX", "Outlander", "Montero", "L200", "Mirage"],
  subaru: ["Impreza", "Legacy", "XV", "Forester", "Outback", "WRX"],
  honda: ["City", "Fit", "Civic", "Accord", "HR-V", "CR-V"],
  chery: ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 7", "Arrizo 5", "IQ"],
};

export function normalizeBrand(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function normalizeModel(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function getModelOptions(selectedBrand: string) {
  return modelOptionsByBrand[normalizeBrand(selectedBrand)] ?? [];
}

export function isKnownBrand(brand: string) {
  return brandOptions.some((option) => normalizeBrand(option) === normalizeBrand(brand));
}

export function isKnownModelForBrand(brand: string, model: string) {
  const options = getModelOptions(brand);
  if (!options.length || !model.trim()) return null;

  return options.some((option) => normalizeModel(option) === normalizeModel(model));
}
