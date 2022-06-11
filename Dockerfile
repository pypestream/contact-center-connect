FROM node:16.6-alpine As build-dev

WORKDIR /ccc

COPY package*.json lerna.json health-check.js ./
COPY ./src ./src
COPY ./config ./config
COPY ./test ./test
COPY ./views ./views
COPY ./public ./public
COPY ./tsconfig.build.json ./tsconfig.build.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./jest.config.js ./jest.config.js

RUN npm install && \
    npm run bootstrap && \
    npm run build && \
    npm run docs:build

FROM node:16.6-alpine as production

WORKDIR /ccc

COPY --from=build-dev /ccc/node_modules ./node_modules
COPY --from=build-dev /ccc/dist ./dist
COPY --from=build-dev /ccc/views ./views
COPY --from=build-dev /ccc/public ./public
COPY --from=build-dev /ccc/package.json ./package.json
COPY --from=build-dev /ccc/health-check.js ./health-check.js

EXPOSE 3000 8082

CMD ["npm", "run", "start:prod"]
