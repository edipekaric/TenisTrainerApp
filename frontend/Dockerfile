# Stage 1: build
FROM node:18-alpine as build

WORKDIR /app
COPY . .

# Inject VITE_API_URL kao build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install
RUN VITE_API_URL=$VITE_API_URL npm run build

# Stage 2: serve
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist /app/dist
RUN npm install -g serve

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
