FROM node:17
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only the package.json and install binaries
COPY package*.json ./
RUN npm install --production

# Copy all of the code and helpers
COPY . .

EXPOSE 8080

CMD [ "npm", "run", "prod" ]