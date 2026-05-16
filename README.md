# ⚡ TalentAI — AI-Powered Applicant Tracking System

<div align="center">

![TalentAI Banner](https://img.shields.io/badge/TalentAI-AI%20Powered%20ATS-FFE000?style=for-the-badge&logo=lightning&logoColor=black)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Hugging%20Face-FFD21E?style=flat-square&logo=huggingface)](https://huggingface.co)

**A completely free, AI-powered ATS that parses resumes, ranks candidates semantically, and lets you chat with your candidate database using LLMs.**

[Live Demo](https://your-vercel-url.vercel.app) · [Backend API](https://your-hf-url.hf.space/docs) · [Report Bug](https://github.com/Baazigar111/talentai/issues)

</div>

---

## 📸 Screenshots

| Dashboard | Candidates | AI Chat |
|---|---|---|
| ![Dashboard](https://via.placeholder.com/300x200/FFE000/111111?text=Dashboard) | ![Candidates](https://via.placeholder.com/300x200/4361EE/FFFFFF?text=Candidates) | ![Chat](https://via.placeholder.com/300x200/06D6A0/111111?text=AI+Chat) |

---

## 🚀 Features

- **📄 Resume Parsing** — Upload PDF/DOCX resumes and automatically extract name, email, phone, skills, experience, and education using NLP
- **🧠 AI Candidate Ranking** — Multi-factor ATS scoring (Skills 40% + Experience 30% + Semantic Similarity 20% + Education 10%)
- **🔍 Semantic Search** — Natural language candidate search powered by FAISS vector database and sentence transformers
- **💬 LLM Recruiter Chat** — Ask questions about your candidates in plain English, powered by Groq's Llama 3.3 70B
- **📊 Recruiter Dashboard** — Overview of pipeline stats, job postings, and top candidates
- **🔐 JWT Authentication** — Secure recruiter signup/login with bcrypt password hashing
- **💼 Job Management** — Create job postings with required skills and experience, rank candidates against any job
- **🆓 100% Free Stack** — No paid APIs required for core functionality

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     TALENTAI PIPELINE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PDF/DOCX Upload                                        │
│       ↓                                                 │
│  Text Extraction (pdfplumber / python-docx)             │
│       ↓                                                 │
│  NLP Parsing (name, email, skills, experience)          │
│       ↓                                                 │
│  Embedding Generation (all-MiniLM-L6-v2, 384-dim)      │
│       ↓                                                 │
│  Vector Storage (FAISS IndexFlatIP)                     │
│       ↓                                                 │
│  ┌──────────────┬──────────────┬────────────────┐       │
│  │ ATS Ranking  │ Semantic     │ LLM Chat       │       │
│  │ (weighted    │ Search       │ (Groq          │       │
│  │  formula)    │ (cosine sim) │  Llama 3.3 70B)│       │
│  └──────────────┴──────────────┴────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 | React framework with App Router |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | High-performance async API framework |
| SQLAlchemy | ORM for database operations |
| Pydantic | Data validation and settings |
| JWT + bcrypt | Authentication and security |
| pdfplumber | PDF text extraction |
| python-docx | DOCX text extraction |

### AI Stack
| Technology | Purpose |
|---|---|
| Sentence Transformers | Generate 384-dim text embeddings |
| all-MiniLM-L6-v2 | Lightweight, fast embedding model |
| FAISS | Facebook AI Similarity Search vector DB |
| Groq API | Cloud LLM inference (Llama 3.3 70B) |
| Ollama | Local LLM inference (development) |
| spaCy | NLP for named entity recognition |

### Infrastructure
| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL cloud database |
| Hugging Face Spaces | Backend deployment (Docker) |
| Vercel | Frontend deployment |
| GitHub | Version control |

---

## 📂 Project Structure

```
talentai/
├── backend/
│   ├── api/
│   │   ├── auth.py          # JWT auth endpoints
│   │   ├── resume.py        # Resume upload & parsing
│   │   ├── jobs.py          # Job CRUD & ranking
│   │   └── ai.py            # Search, match, chat
│   ├── core/
│   │   ├── config.py        # Pydantic settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── security.py      # JWT & bcrypt utils
│   ├── models/
│   │   ├── user.py          # User DB model
│   │   ├── candidate.py     # Candidate DB model
│   │   └── job.py           # Job & Application models
│   ├── services/
│   │   ├── resume_parser.py # PDF/DOCX parsing + NLP
│   │   ├── embeddings.py    # Sentence transformer wrapper
│   │   ├── vector_store.py  # FAISS index management
│   │   ├── ranking.py       # ATS scoring engine
│   │   └── ai_chat.py       # Groq + Ollama chat service
│   ├── schemas/             # Pydantic request/response models
│   ├── utils/               # File handling utilities
│   ├── main.py              # FastAPI app entry point
│   ├── Dockerfile           # HF Spaces deployment
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (dashboard)/
    │   │   │   ├── dashboard/   # Pipeline overview
    │   │   │   ├── candidates/  # AI ranking page
    │   │   │   ├── jobs/        # Job management
    │   │   │   ├── search/      # Semantic search
    │   │   │   ├── chat/        # LLM chat interface
    │   │   │   └── upload/      # Resume upload
    │   │   └── login/           # Auth page
    │   ├── components/
    │   │   └── Sidebar.tsx      # Navigation sidebar
    │   ├── lib/
    │   │   └── api.ts           # Axios API client
    │   └── store/
    │       └── authStore.ts     # Zustand auth state
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/Baazigar111/talentai.git
cd talentai
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Install Ollama (optional, for local LLM)
# https://ollama.com/download
ollama pull llama3.2
```

### 3. Environment Variables
Create `backend/run.py` (for local dev only, not committed):
```python
import os
import uvicorn

os.environ["DATABASE_URL"] = "postgresql://user:pass@host:5432/dbname"
os.environ["SECRET_KEY"] = "your-secret-key"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "1440"
os.environ["UPLOAD_DIR"] = "./uploads"
os.environ["GROQ_API_KEY"] = "your-groq-key"  # optional

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### 4. Run Backend
```bash
cd backend
python run.py
# API docs: http://localhost:8000/docs
```

### 5. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run dev server
npm run dev
# App: http://localhost:3000
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new recruiter |
| POST | `/auth/login` | Login and get JWT token |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resume/upload` | Upload and parse resume |
| GET | `/resume/{id}` | Get candidate by ID |
| DELETE | `/resume/{id}` | Remove candidate |
| PATCH | `/resume/{id}/update-name` | Update candidate name |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs/create` | Create job posting |
| GET | `/jobs/` | List all jobs |
| GET | `/jobs/{id}` | Get job details |
| GET | `/jobs/{id}/rank-candidates` | AI rank all candidates |
| DELETE | `/jobs/{id}` | Delete job |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/search` | Semantic candidate search |
| POST | `/ai/match` | Match candidates to job |
| POST | `/ai/chat` | LLM recruiter chat |
| GET | `/ai/status` | Check AI provider status |

---

## 🧠 AI Scoring Formula

```
ATS Score = (Skills Match × 40%) + 
            (Experience Match × 30%) + 
            (Semantic Similarity × 20%) + 
            (Education Score × 10%)
```

**Skills Match** — Percentage of required skills found in candidate's resume  
**Experience Match** — Candidate experience vs minimum required (capped at 100%)  
**Semantic Similarity** — Cosine similarity between resume and job description embeddings  
**Education Score** — Presence and quantity of educational qualifications  

---

## 🤖 AI Chat Examples

```
You: "Who is the best candidate for a backend role?"
AI:  "Based on the data, Ankit Kumar Gupta is your strongest backend 
      candidate with Python, FastAPI, PostgreSQL, and Docker skills..."

You: "Find React developers"  
AI:  "Found 2 candidates with React experience: ..."

You: "Show all candidates"
AI:  "There are 3 candidates in your database: ..."
```

---

## 🚀 Deployment

### Backend → Hugging Face Spaces
1. Create a Space with Docker SDK
2. Push backend files
3. Set environment variables in Space Settings → Secrets

### Frontend → Vercel
1. Import GitHub repo
2. Set Root Directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` environment variable

---

## 🗺️ Roadmap

- [ ] Email automation for shortlisted candidates
- [ ] AI-generated interview questions per candidate
- [ ] Analytics dashboard with hiring funnel metrics
- [ ] Bulk resume upload (ZIP file support)
- [ ] Candidate comparison side-by-side view
- [ ] Export ranked candidates to CSV/PDF
- [ ] Multi-recruiter workspace support
- [ ] Voice screening AI integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Ankit Kumar Gupta**  
- GitHub: [@Baazigar111](https://github.com/Baazigar111)  
- Email: wwwankitgupta7@gmail.com  
- LinkedIn: [your-linkedin-url]

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Built with ❤️ using FastAPI, Next.js, and open-source AI

</div>
