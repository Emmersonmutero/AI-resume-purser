import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load environment variables from .env if present
    load_dotenv()

    # On Windows with Firebase Admin, ensure GOOGLE_APPLICATION_CREDENTIALS if json available
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not cred_path:
        # Fallback to a local service account json in repo if present
        default_json = os.path.join(os.path.dirname(__file__), "sjat-5a48f-firebase-adminsdk-fbsvc-1fd443c072.json")
        if os.path.exists(default_json):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = default_json

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)