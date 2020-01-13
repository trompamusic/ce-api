FROM node:10.13.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

RUN git clone --depth 1 https://github.com/neo4j-graphql/neo4j-graphql-js
RUN cd /app/neo4j-graphql-js && npm install
RUN cd /app/neo4j-graphql-js && npm run build

RUN ls -al /app/neo4j-graphql-js

RUN cp -R /app/neo4j-graphql-js/dist /app/node_modules/neo4j-graphql-js/dist

EXPOSE 80

CMD ["npm", "start"]
