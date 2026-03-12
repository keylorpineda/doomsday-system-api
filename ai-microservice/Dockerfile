FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelo de spaCy en español (solo procesamiento NLP, no generativo)
RUN python -m spacy download es_core_news_sm

COPY . .

# Cloud Run inyecta la variable PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
