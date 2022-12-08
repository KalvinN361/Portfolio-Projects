# This is a dockerized version of a server that you can easily deploy somewhere.
# If you don't want server rendering, you can safely delete this file.

FROM node:alpine

# install git
RUN apk fix && \
    apk --no-cache --update add git git-lfs less openssh && \
    git lfs install 
    
# install GCC
RUN apk add build-base

# install python
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN python3 -m pip install --upgrade git+https://github.com/yt-dlp/yt-dlp.git@release && \
    python3 -m pip install apprise
# Installs latest Chromium (85) package.
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  ffmpeg 
RUN mkdir -p /home/pptruser/Downloads /app /app/out /app/src
# RUN npm install 
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV YOUTUBE_DL_FILENAME=yt-dlp
ENV YOUTUBE_DL_DIR=/usr/bin
COPY package*.json ./app/
COPY tsconfig.json ./app/
COPY src /app/src/
COPY *.ts /app/
COPY *.tsx /app/
WORKDIR /app
RUN npm i --python=3.8
RUN chmod +w /usr/bin/yt-dlp

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app \
  && chown -R pptruser:pptruser /app/out \
  # && chown -R pptruser:pptruser / \
  && chown -R pptruser:pptruser /app/node_modules

# Run everything after as non-privileged user.
USER pptruser

EXPOSE 8000

CMD ["npm", "run", "server"] 
