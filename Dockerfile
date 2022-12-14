FROM node:17-alpine AS base

WORKDIR /app

FROM base AS builder

# Copy only the package.json and install binaries
COPY package*.json .babelrc ./
RUN npm install

# Copy all of the code and helpers
COPY . .

RUN npm run build
RUN npm prune --production

FROM base as release

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

EXPOSE 8080

USER node

CMD [ "node", "build/index.js", "backend-port=8080" ]