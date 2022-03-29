# Base image
FROM node:alpine

# Specify working directory
WORKDIR /usr/local/apps/gateway-auth

# Install dependencies
COPY ["package.json", "./"]
RUN yarn install

# Copy project files
COPY . .

CMD ["yarn", "watch"]
