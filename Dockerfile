FROM node:lts-alpine3.9
LABEL maintainer="David Francis <david@iamdavidfrancis.com>"

USER root
ENV APP /usr/src/APP

COPY package.json /tmp/package.json

RUN cd /tmp && npm install --loglevel=warn \
    && mkdir -p $APP \
    && mv /tmp/node_modules $APP

# Set TZ to Seattle time to fix issues when UTC rolls over
RUN apk add tzdata && cp /usr/share/zoneinfo/America/Los_Angeles /etc/localtime \
    && echo "America/Los_Angeles" > /etc/timezone \
    $$ apk del tzdata

COPY src $APP/src
COPY package.json $APP
COPY tsconfig.json $APP

WORKDIR $APP

RUN npm run build

CMD [ "node", "dist/index.js" ]