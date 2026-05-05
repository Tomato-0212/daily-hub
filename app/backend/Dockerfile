# Stage 1: Install dependencies
FROM node:20-alpine AS builder

# สร้าง directory สำหรับ application
WORKDIR /app

COPY package*.json ./

# ติดตั้ง dependencies ทั้งหมด
RUN npm install

COPY . .

# Stage 2: Production Stage
FROM node:20-alpine

ENV NODE_ENV=production

# Copy ไฟล์ที่จำเป็นจาก builder stage
COPY --from=builder /app /package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3003

CMD ["npm", "start"]

