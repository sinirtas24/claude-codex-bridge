import type { Language, ThumbnailConcept } from "./types";

const fallbackByLanguage: Record<Language, Array<Pick<ThumbnailConcept, "title" | "hook">>> = {
  tr: [
    { title: "BUNU KİMSE SÖYLEMİYOR", hook: "GERÇEK SONUÇ" },
    { title: "DENEDİM VE ŞAŞIRDIM", hook: "ADIM ADIM" },
    { title: "EN BÜYÜK HATA BU", hook: "HEMEN DÜZELT" },
  ],
  de: [
    { title: "DAS SAGT DIR KEINER", hook: "ECHTES ERGEBNIS" },
    { title: "ICH HABE ES GETESTET", hook: "SCHRITT FÜR SCHRITT" },
    { title: "DIESER FEHLER KOSTET", hook: "JETZT VERMEIDEN" },
  ],
  en: [
    { title: "NOBODY TELLS YOU THIS", hook: "REAL RESULTS" },
    { title: "I TRIED IT MYSELF", hook: "STEP BY STEP" },
    { title: "STOP MAKING THIS MISTAKE", hook: "FIX IT NOW" },
  ],
};

export function fallbackConcepts(topic: string, language: Language): ThumbnailConcept[] {
  const subject = topic.trim().slice(0, 140);
  const placements = ["subject-right", "subject-left", "subject-center"] as const;
  const colors = ["#ffbd2e", "#55dcff", "#ff5a3d"];
  return fallbackByLanguage[language].map((copy, index) => ({
    ...copy,
    scene: `A cinematic creator scene about ${subject}, with relevant props and clear visual storytelling.`,
    accentColor: colors[index],
    composition: placements[index],
  }));
}
