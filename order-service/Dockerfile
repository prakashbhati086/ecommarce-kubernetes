FROM node:18-alpine

WORKDIR /app

# Create data directory
RUN mkdir -p /app/data

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5002

CMD ["npm", "start"]
