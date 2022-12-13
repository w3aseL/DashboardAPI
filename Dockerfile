FROM node:14-alpine

WORKDIR /usr/src/app

# Copy only the package.json and install binaries
COPY package.json ./
RUN yarn install

# Copy all of the code and helpers
COPY . .

EXPOSE 8080

CMD [ "npm", "run", "prod" ]