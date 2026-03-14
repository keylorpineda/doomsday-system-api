FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelo de spaCy en español via pip (versión compatible con spacy 3.7.x)
RUN pip install --no-cache-dir https://github.com/explosion/spacy-models/releases/download/es_core_news_sm-3.7.0/es_core_news_sm-3.7.0-py3-none-any.whl

COPY . .

# Cloud Run inyecta la variable PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
