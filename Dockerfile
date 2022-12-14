FROM node:17
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only the package.json and install binaries
COPY package*.json ./
RUN npm install

# Copy all of the code and helpers
COPY . .
RUN npm run build

EXPOSE 8080

CMD [ "node", "build/index.js", "backend-port=8080" ]