import kagglehub, csv, os
from collections import Counter
from .firestore_client import upsert_analytics

def ingest_kaggle_resume_dataset():
    """
    Downloads the Kaggle dataset and computes top skill frequencies per category.
    Stores a compact summary in Firestore analytics/kaggleSkills.
    """
    path = kagglehub.dataset_download("gauravduttakiit/resume-dataset")
    skills_counter = Counter()
    total = 0

    # The dataset contains 'Resume.csv' in many forks. We scan for .csv files.
    for root, _, files in os.walk(path):
        for f in files:
            if not f.lower().endswith(".csv"): 
                continue
            fp = os.path.join(root, f)
            try:
                with open(fp, "r", encoding="utf-8", errors="ignore") as fh:
                    reader = csv.DictReader(fh)
                    for row in reader:
                        text = " ".join([str(v) for v in row.values()])
                        total += 1
                        for token in text.split():
                            t = token.strip().lower()
                            if 2 <= len(t) <= 30 and t.isalpha():
                                skills_counter[t] += 1
            except Exception:
                continue

    top = dict(skills_counter.most_common(100))
    upsert_analytics("kaggleSkills", {"totalRows": total, "top": top})
    return {"totalRows": total, "uniqueTokens": len(skills_counter), "topCount": len(top)}
