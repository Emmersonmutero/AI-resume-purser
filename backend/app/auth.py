from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth as fb_auth, credentials

cred_initialized = False

def init_firebase_admin():
    global cred_initialized
    if cred_initialized:
        return
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(credentials.ApplicationDefault())
    cred_initialized = True

bearer = HTTPBearer(auto_error=False)

async def require_firebase_user(request: Request):
    """
    Read Authorization: Bearer <idToken> from client (getIdToken()) and verify.
    Returns decoded token (dict) with 'uid', 'email', etc.
    """
    init_firebase_admin()
    creds: HTTPAuthorizationCredentials | None = await bearer(request)
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")
    token = creds.credentials
    try:
        decoded = fb_auth.verify_id_token(token, check_revoked=True)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {e}")
