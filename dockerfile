FROM node:latest

WORKDIR /the/workdir/path     

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]