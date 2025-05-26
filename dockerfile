FROM python:3.9-slim

WORKDIR /app

COPY backend.py .

RUN pip install flask flask-cors

CMD ["python", "backend.py"]
