# AI Resume Parser

A comprehensive AI-powered resume parser application built with React (frontend) and Python (backend). This application allows HR professionals and recruiters to efficiently analyze, parse, and manage resumes using advanced AI technology.

## 🚀 Features

### Frontend Features
- **Modern Authentication System**: Secure login/signup with Firebase Authentication
- **Role-Based Access Control**: Separate dashboards for HR and candidates
- **Social Login**: Google and Facebook authentication support
- **Responsive Design**: Mobile-first design with glassmorphism UI
- **Toast Notifications**: Real-time feedback for user actions
- **Error Boundaries**: Robust error handling and recovery
- **Dark/Light Theme Support**: User preference-based theming
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### Backend Features
- **AI-Powered Resume Parsing**: Extract structured data from PDF/DOC resumes
- **Multiple File Format Support**: PDF, DOC, DOCX parsing capabilities
- **RESTful API**: Clean API endpoints for seamless integration
- **Database Integration**: Secure data storage with Firebase/MongoDB
- **File Upload Management**: Secure file handling and validation
- **Analytics & Reporting**: Resume parsing statistics and insights

### Core Functionalities
- Resume text extraction and parsing
- Skills and experience analysis
- Education and certification extraction
- Contact information parsing
- Job matching and recommendations
- Resume scoring and ranking
- Batch processing capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Firebase Auth** - Authentication and user management
- **Context API** - State management
- **CSS3** - Modern styling with animations and transitions

### Backend
- **Python 3.x** - Core backend language
- **FastAPI/Flask** - Web framework
- **spaCy/NLTK** - Natural language processing
- **PyPDF2/pdfplumber** - PDF text extraction
- **python-docx** - Word document processing
- **Firebase/MongoDB** - Database solutions

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- Git

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Emmersonmutero/ai-resume-parser.git
   cd ai-resume-parser/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ../backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=your_database_url
   SECRET_KEY=your_secret_key
   FIREBASE_ADMIN_SDK=path_to_firebase_admin_sdk.json
   ```

5. **Start backend server**
   ```bash
   python app.py
   ```

## 🚀 Usage

### For HR Professionals
1. **Sign up/Login** to access the HR dashboard
2. **Upload resumes** in PDF or DOC format
3. **View parsed data** including skills, experience, and education
4. **Search and filter** candidates based on criteria
5. **Export reports** and analytics

### For Candidates
1. **Create account** and upload your resume
2. **View parsing results** and suggestions for improvement
3. **Track application status** and job matches
4. **Update profile** and resume information

## 📁 Project Structure

```
ai-resume-parser/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── styles/         # CSS stylesheets
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main application component
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app.py              # Main application entry
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── requirements.txt
├── README.md
└── .gitignore
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Resume Processing
- `POST /api/resumes/upload` - Upload and parse resume
- `GET /api/resumes/` - Get all resumes
- `GET /api/resumes/:id` - Get specific resume
- `PUT /api/resumes/:id` - Update resume data
- `DELETE /api/resumes/:id` - Delete resume

### Analytics
- `GET /api/analytics/stats` - Get parsing statistics
- `GET /api/analytics/reports` - Generate reports

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
pytest
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service

### Backend Deployment (Railway/Heroku)
1. Create a `Dockerfile` or use the existing deployment configuration
2. Deploy to your preferred cloud platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Emmerson Mutero**
- GitHub: [@Emmersonmutero](https://github.com/Emmersonmutero)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- Firebase for authentication services
- React community for excellent documentation
- Open source libraries that made this project possible

## 📞 Support

If you have any questions or need support, please:
1. Check the [Issues](https://github.com/Emmersonmutero/ai-resume-parser/issues) page
2. Create a new issue if your question isn't already addressed
3. Contact the maintainer directly

---

**⭐ Star this repository if you find it helpful!**
