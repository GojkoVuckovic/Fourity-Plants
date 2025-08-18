FROM node:21-alpine3.18 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone output
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN npm install sharp

EXPOSE 3000

CMD ["node", "server.js"]
