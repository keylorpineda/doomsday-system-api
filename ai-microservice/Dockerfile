FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelo de spaCy en español (solo procesamiento NLP, no generativo)
RUN python -m pip install --no-cache-dir es-core-news-sm==3.7.0

COPY . .


EXPOSE 8080

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
