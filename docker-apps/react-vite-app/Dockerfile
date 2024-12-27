FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.27.3-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
# CMD ["npm", "run", "dev"]