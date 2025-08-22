from collections import Counter
import re

SENIOR_HINTS = ("lead","mentor","ownership","production","scale","performance","optimiz","architecture")
WORD = re.compile(r"[a-zA-Z+#.-]{2,}")

def tokenize(t: str) -> list[str]:
    return [w.lower() for w in WORD.findall(t)]

def score_resume(parsed: dict, jd_text: str) -> tuple[int, list[str]]:
    jd_tokens = set(tokenize(jd_text))
    resume_tokens = set(tokenize(" ".join(parsed.get("skills", [])) + " " + parsed.get("summary","")))
    overlap = jd_tokens.intersection(resume_tokens)
    # skill-weighted score
    base = len(overlap) / max(1, len(resume_tokens))
    # add boost for seniority hints present in JD & resume bullets
    resume_blob = " ".join((parsed.get("summary",""), " ".join(parsed.get("skills", [])),
                            " ".join(b for exp in parsed.get("experience", []) for b in exp.get("bullets",[]))))
    bonus = sum(1 for k in SENIOR_HINTS if (k in jd_tokens and k in resume_blob.lower())) * 0.02
    score = min(1.0, base + bonus)
    reasons = [
        f"Token overlap {len(overlap)} / {len(resume_tokens)}",
        "Seniority bonus applied" if bonus > 0 else "No seniority bonus"
    ]
    return round(score * 100), reasons
