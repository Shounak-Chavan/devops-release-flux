FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy app code
COPY . .

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Give ownership
RUN chown -R appuser:appgroup /app

# Switch user
USER appuser

EXPOSE 8000

CMD ["node", "src/server.js"]