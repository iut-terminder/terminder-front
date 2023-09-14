FROM node:18.12.0

LABEL maintainer="Amir Arsalan Yavari <arya48.yavari79@gmail.com>"
LABEL description="Docker image for terMinder application frontend"
LABEL org.label-schema.vcs-url="https://github.com/iut-terminder/terminder-front"

RUN npm install -g pnpm

RUN adduser --disabled-password --home /app --uid 5173 --gecos "terMinder" terminder  && \
    install -m 0740 -o terminder -g terminder -d /app \
    && chown -R terminder:terminder /app/ && umask 0037
USER terminder

WORKDIR /app
COPY --chmod=700 --chown=terminder:terminder package*.json .
RUN npm i
COPY --chmod=700 --chown=terminder:terminder . .
EXPOSE 5173

ENTRYPOINT ["npm", "run", "start"]
