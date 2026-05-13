FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy ALL backend files into /app directly
COPY api/ ./api/
COPY core/ ./core/
COPY models/ ./models/
COPY schemas/ ./schemas/
COPY services/ ./services/
COPY utils/ ./utils/
COPY main.py .

RUN mkdir -p uploads

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]