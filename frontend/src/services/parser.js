// Minimal local parser: extracts text from PDF/TXT and computes simple skill-based features.
// Later we'll call backend /api/parse-groq for LLM enrichment.

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// A compact skills dictionary (expandable)
const SKILLS = [
  "javascript","typescript","react","redux","node","express","python","django","flask",
  "java","spring","kotlin","swift","c++","sql","postgresql","mysql","mongodb","firebase",
  "docker","kubernetes","aws","gcp","azure","git","html","css","sass","graphql","rest",
  "nlp","llm","pandas","numpy","scikit","tensorflow","pytorch"
];

export async function extractText(file) {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "txt") {
    return await file.text();
  }
  if (ext === "pdf") {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return text;
  }
  throw new Error("Currently supported: PDF or TXT. (DOCX support comes with backend step.)");
}

export function naiveParse(text) {
  const lower = text.toLowerCase();
  const skills = SKILLS.filter((s) => lower.includes(s));
  // attempt email/phone extraction
  const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])[0] || "";
  const phone = (text.match(/(\+?\d[\d\s-]{7,}\d)/g) || [])[0] || "";
  // extract experiences heuristically
  const expLines = text
    .split("\n")
    .filter((l) => /(experience|worked|developer|engineer|manager|intern)/i.test(l))
    .slice(0, 12);

  return {
    contact: { email, phone },
    skills,
    summary: text.slice(0, 600),
    experience: expLines,
  };
}

// Simple match: JD vs resume based on skill overlap + keyword hits
export function matchScore(parsedResume, jdText) {
  const text = jdText.toLowerCase();
  const hits = parsedResume.skills.filter((s) => text.includes(s));
  const base = parsedResume.skills.length ? (hits.length / parsedResume.skills.length) : 0;
  const bonus = (text.match(/(lead|mentor|ownership|production|scale|performance)/g) || []).length * 0.03;
  const score = Math.min(1, base + bonus);
  const reasons = [
    `Skills overlap: ${hits.join(", ") || "none"}`,
    bonus > 0 ? "Bonus for senior keywords" : "No seniority bonus",
  ];
  return { score: Math.round(score * 100), reasons };
}
