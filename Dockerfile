FROM node:16.6-alpine As build

WORKDIR /ccp

COPY package*.json lerna.json ./
COPY ./app ./app
COPY ./config ./config
COPY ./lib ./lib

RUN npm install && \
    npm run bootstrap && \
    npm run build

FROM node:16.6-alpine as production

WORKDIR /ccp

COPY --from=build /ccp/node_modules ./node_modules
COPY --from=build /ccp/lib ./lib
COPY --from=build /ccp/app/ccp-bridge/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
