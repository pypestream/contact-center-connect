FROM node:16.6-alpine As build-dev

WORKDIR /ccc

COPY package*.json lerna.json ./
COPY ./src ./src
COPY ./config ./config

RUN npm install && \
    npm run bootstrap && \
    npm run build && \
    npm run docs:build

FROM node:16.6-alpine as production

WORKDIR /ccc

COPY --from=build-dev /ccc/node_modules ./node_modules
COPY --from=build-dev /ccc/lib ./lib
COPY --from=build-dev /ccc/app/ccc-bridge/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
