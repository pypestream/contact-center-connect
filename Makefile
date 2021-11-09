build:
	docker image build . --no-cache -t $(image):$(version)-build --target build-dev
	docker image build . -t $(image):$(version)

build-dev:
	docker image build . --pull -t $(image):$(version)-build --target build-dev
	docker image build . -t $(image):$(version)

build-test:
	DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker image build . -f Dockerfile.test --no-cache -t $(image):$(version)-test \
	    --build-arg image=$(image) \
	    --build-arg version=$(version)-build

test:
	docker run -e CI=true $(image):$(version)-test npm run test:nestjs-client

.PHONY: build build-dev build-test test
