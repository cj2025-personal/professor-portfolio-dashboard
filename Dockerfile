# Cloud Run image for the professor portfolio dashboard.
#
# Two stages: Create React App compiles to static files, then a small nginx
# serves them. The build toolchain never reaches the final image.
#
# CRA inlines REACT_APP_* variables at BUILD time, not at run time, so they
# arrive as build args. Neither is a credential — a backend URL and a Google
# OAuth client id, which is public by design. The client SECRET is deliberately
# absent: no code reads it, and it is what leaked through git history.
FROM node:20-slim AS build

# Defaults so a plain `docker build` (or `gcloud builds submit --tag`, which
# cannot pass build args) produces a working image. The workflow overrides both
# with --build-arg. Neither is secret.
ARG REACT_APP_BACKEND_URI=https://professor-portfolio-api-77137640226.us-central1.run.app
ARG REACT_APP_GOOGLE_CLIENT_ID=17983686650-sr1rhml8mroul4avfhjg6dcjhnpk58vv.apps.googleusercontent.com
ENV REACT_APP_BACKEND_URI=$REACT_APP_BACKEND_URI \
    REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID \
    CI=false

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine

# Cloud Run sends traffic to $PORT (8080 by default) and nginx cannot read an
# environment variable in its config, so the template is rendered at start.
# nginx:alpine runs everything in /docker-entrypoint.d/ before starting, and
# 20-envsubst-on-templates.sh expands /etc/nginx/templates/*.template.
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
