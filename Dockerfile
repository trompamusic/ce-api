FROM node:14.18-alpine3.12

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY src src/
COPY .babelrc ./
RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start:prod"]
