FROM node:17-alpine AS base

WORKDIR /app

# Copy only the package.json and install binaries
COPY package*.json .babelrc ./
RUN npm install

# Copy all of the code and helpers
COPY . .

RUN npm run build
RUN npm prune --production

RUN chown -R node.node /app

USER node

CMD [ "node", "build/index.js", "backend-port=8080" ]