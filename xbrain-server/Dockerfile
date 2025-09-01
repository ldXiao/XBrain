# xbrain-server Dockerfile using uv base image from Docker Hub
FROM docker.io/astral/uv:python3.12-bookworm-slim

WORKDIR /app

# Copy only dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies globally (system-wide) using the lockfile
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

# Now copy the rest of the code
COPY . .

EXPOSE 8000

# Run the app using system Python
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
