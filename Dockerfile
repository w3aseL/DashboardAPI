FROM node:17

WORKDIR /usr/src/app

# Copy only the package.json and install binaries
COPY package*.json ./
RUN npm install

# Copy all of the code and helpers
COPY . .

EXPOSE 8080

CMD [ "babel-node", "src/index.js", "backend-port=8080" ]