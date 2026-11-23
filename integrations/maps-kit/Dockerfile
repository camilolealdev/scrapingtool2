FROM python:3.12-slim

ARG KIT_REPO=https://github.com/Mahanaicoach/google-maps-scraper-kit.git
ARG KIT_REF

RUN test -n "$KIT_REF" \
  && apt-get update \
  && apt-get install -y --no-install-recommends git chromium ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && git clone --depth 1 --branch "$KIT_REF" "$KIT_REPO" /kit \
  && useradd --create-home --uid 10001 gmskit \
  && mkdir -p /kit/.engine/data \
  && chown -R gmskit:gmskit /kit

WORKDIR /kit
USER gmskit
ENV CHROME=/usr/bin/chromium PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "engine/serve.py", "--host", "0.0.0.0", "--port", "8080"]
