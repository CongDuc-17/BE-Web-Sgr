# # Define the base stage
# FROM node:22.1.0

# WORKDIR /app

# COPY ./package*.json ./
# COPY ./tsconfig*.json ./
# COPY ./pnpm-lock.yaml ./

# RUN npm install -g pnpm
# RUN pnpm install

# COPY . .

# RUN pnpm db:gen-dto
# RUN pnpm build

# # Define the build stage
# FROM node:22.1.0-alpine AS base

# WORKDIR /app

# COPY ./package*.json ./
# COPY ./tsconfig*.json ./
# COPY ./pnpm-lock.yaml ./

# FROM base AS build

# RUN npm install -g pnpm
# RUN pnpm install

# COPY . .

# RUN pnpm db:gen-dto
# RUN pnpm build
# RUN pnpm prune --prod

# FROM base AS deloy
# # Define the deploy stage

# COPY --from=build /app/dist /app/dist
# COPY --from=build /app/node_modules /app/node_modules

# # EXPOSE 3000


# CMD ["node", "dist/src/main.js"]



# ---- Build stage ----
FROM node:22.1.0 AS build
WORKDIR /app

# Copy package files và schema trước
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Cài dependencies (bao gồm dev)
RUN npm install

# Copy source code
COPY . .

# Build Typescript -> dist
RUN npm run build

# Cài lại chỉ production deps
RUN npm prune --production


# ---- Production stage ----
FROM node:22.1.0-alpine AS production
WORKDIR /app

# Copy node_modules (đã prune), dist và prisma từ build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/app.js"]
