# Stage 1: build
FROM node:18-alpine as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2: serve
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist /app/dist
RUN npm install -g serve

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
