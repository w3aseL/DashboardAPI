FROM node:alpine

WORKDIR /usr/src/app

# Copy only the package.json and install binaries
COPY package.json ./
RUN yarn install

# Copy all of the code and helpers
COPY . .

CMD [ "npm", "run", "prod" ]