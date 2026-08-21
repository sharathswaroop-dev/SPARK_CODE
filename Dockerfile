FROM node:20-alpine AS base

# Install Python 3, C++ compiler (g++), and Java OpenJDK
RUN apk add --no-cache python3 py3-pip make g++ openjdk17-jdk

# Ensure python symlink points to python3
RUN ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source files
COPY . .

# Generate Prisma Client & build Next.js
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
