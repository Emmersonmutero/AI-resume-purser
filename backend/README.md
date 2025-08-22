# AI Resume Parser Backend

A FastAPI-based backend service for parsing resumes using Groq LLM and storing data in Firebase Firestore.

## Features

- 🤖 **AI-Powered Resume Parsing** - Uses Groq's LLM to extract structured data from resumes
- 📊 **Semantic Search** - Generate embeddings for resume content using sentence-transformers
- 🔥 **Firebase Integration** - Store and manage resume data in Firestore
- 🔐 **Authentication** - Firebase Auth integration for secure access
- 🚀 **REST API** - FastAPI-based REST endpoints

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your API keys and configuration.

3. **Setup Firebase**
   - Place your Firebase Admin SDK service account JSON file in the backend directory
   - The default expected filename is: `sjat-5a48f-firebase-adminsdk-fbsvc-1fd443c072.json`

4. **Run the Server**
   ```bash
   python run.py
   ```
   
   The server will start on `http://localhost:8000` (or the port specified in your `.env` file).

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `POST /api/parse-resume-groq` - Parse a resume using Groq LLM
- `POST /api/index-resume` - Index a parsed resume for search
- `GET /api/search?q=query` - Search resumes semantically

### Admin Endpoints
- `POST /admin/reindex-all` - Reindex all resumes (admin only)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Your Groq API key |
| `ALLOWED_ORIGINS` | No | CORS origins (default: empty) |
| `PORT` | No | Server port (default: 8000) |
| `ALLOW_ADMIN_EMAIL` | No | Admin email for admin endpoints |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | Firebase service account path |

## Development

- The server runs with auto-reload enabled in development
- Check `run.py` for server configuration
- Firebase credentials are automatically detected

## Architecture

```
backend/
├── app/
│   ├── main.py           # FastAPI app and routes
│   ├── auth.py           # Firebase authentication
│   ├── groq_client.py    # Groq LLM integration
│   ├── embeddings.py     # Sentence transformers
│   ├── firestore_client.py # Firebase Firestore client
│   └── ...
├── run.py               # Server runner
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## Troubleshooting

1. **Import Errors**: Ensure all dependencies are installed via `pip install -r requirements.txt`
2. **Firebase Errors**: Verify your service account JSON file is in the correct location
3. **Groq Errors**: Check your GROQ_API_KEY is valid and has sufficient credits
4. **CORS Issues**: Add your frontend URL to ALLOWED_ORIGINS in .env
