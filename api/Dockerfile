FROM node:10.13.0-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
RUN npm install
COPY . .

EXPOSE 80

CMD ["npm", "start"]