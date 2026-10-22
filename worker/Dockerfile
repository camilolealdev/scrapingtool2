FROM python:3.12-slim
WORKDIR /app
COPY worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY dorking_scraper.py .
COPY src/utils/builderSignatures.json src/utils/builderSignatures.json
COPY worker/app.py .
USER nobody
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
