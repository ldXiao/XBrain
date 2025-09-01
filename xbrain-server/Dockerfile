# xbrain-server Dockerfile using uv base image from Docker Hub
FROM docker.io/astral/uv:python3.12-bookworm-slim

RUN apt-get update && apt-get install -y bash
WORKDIR /app

# Copy only dependency files first for better caching
COPY pyproject.toml uv.lock ./

RUN uv sync

# Now copy the rest of the code
COPY . .

EXPOSE 8000


# Install dependencies and run the app at container start
ENTRYPOINT ["uvx", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
