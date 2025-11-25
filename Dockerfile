FROM node:25-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Start script will handle DB initialization and app startup
CMD ["sh", "-c", "npm run init-db && npm run dev"]

