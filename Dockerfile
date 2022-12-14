FROM node:17-alpine

WORKDIR /app

# Copy only the package.json and install binaries
COPY package*.json .babelrc ./
RUN npm install

# Copy all of the code and helpers
COPY . .

RUN npm run build
RUN npm prune --production

EXPOSE 8080

CMD [ "node", "build/index.js", "backend-port=8080" ]