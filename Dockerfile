FROM node:10.13.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install
RUN npm build
COPY . .

EXPOSE 80

CMD ["npm", "start:prod"]
