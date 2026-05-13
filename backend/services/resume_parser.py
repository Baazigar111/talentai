try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

import pdfplumber
import docx
import re
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        if PYMUPDF_AVAILABLE:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs]).strip()

def extract_email(text: str) -> str:
    match = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match[0] if match else ""

def extract_phone(text: str) -> str:
    match = re.findall(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', text)
    return match[0] if match else ""

def extract_name(text: str) -> str:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # spaCy NER — must be 2+ words
    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
            return ent.text

    # Fallback: first short clean line that looks like a name
    for line in lines[:5]:
        if (
            len(line.split()) >= 2
            and len(line.split()) <= 5
            and len(line) < 50
            and "@" not in line
            and not any(c.isdigit() for c in line)
            and line[0].isupper()
        ):
            return line

    return lines[0] if lines else ""
    
def extract_skills(text: str) -> list:
    SKILLS_DB = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "Vue",
        "FastAPI", "Django", "Flask", "Node.js", "Express",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure",
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
        "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
        "Git", "Linux", "REST API", "GraphQL", "SQL",
        "HTML", "CSS", "Tailwind", "Java", "C++", "C#", "Go", "Rust",
        "LangChain", "OpenAI", "Hugging Face", "FAISS", "Vector DB"
    ]
    found = []
    text_lower = text.lower()
    for skill in SKILLS_DB:
        if skill.lower() in text_lower:
            found.append(skill)
    return found

def extract_experience_years(text: str) -> float:
    matches = re.findall(r'(\d+)\+?\s*years?\s*(?:of)?\s*experience', text, re.IGNORECASE)
    if matches:
        return float(max(matches, key=lambda x: int(x)))
    return 0.0

def extract_education(text: str) -> list:
    education = []
    degrees = ["B.Tech", "B.E", "M.Tech", "MBA", "BCA", "MCA", "B.Sc", "M.Sc",
               "Bachelor", "Master", "PhD", "Doctorate", "Diploma"]
    lines = text.split('\n')
    for line in lines:
        for degree in degrees:
            if degree.lower() in line.lower():
                education.append(line.strip())
                break
    return education[:3]  # top 3

def parse_resume(file_path: str, filename: str) -> dict:
    # Extract text based on file type
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(file_path)
    else:
        text = ""

    return {
        "raw_text": text,
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "experience_years": extract_experience_years(text),
        "education": extract_education(text),
    }