FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
ENV APP_ENV=production
EXPOSE 8000
CMD ["sh", "-c", "python -m backend.manage indexes && uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
