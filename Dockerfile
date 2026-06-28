# Use official Python runtime as a parent image
FROM python:3.11-slim

# Install Node.js (v20 LTS) and npm for running MCP Remote client via npx
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify installations during build stage
RUN python --version && node --version && npm --version && npx --version

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory inside container
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY backend/ .

# Expose port (Railway dynamically sets PORT env variable)
EXPOSE 8000

# Run FastAPI app using uvicorn, binding to Railway's PORT variable (defaulting to 8000)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
