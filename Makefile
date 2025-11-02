# Makefile for BizManager Application

# Variables
APP_NAME = bizmanager
DOCKER_IMAGE = bizmanager:latest

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build the application"
	@echo "  make start       - Start production server"
	@echo "  make seed        - Seed the database"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run  - Run Docker container"
	@echo "  make docker-dev  - Start docker-compose environment"
	@echo "  make deploy      - Deploy to VPS"
	@echo "  make test        - Run tests (if available)"
	@echo "  make clean       - Clean build artifacts"

# Install dependencies
.PHONY: install
install:
	npm install

# Development
.PHONY: dev
dev:
	npm run dev

# Build
.PHONY: build
build:
	npm run build

# Production start
.PHONY: start
start:
	npm run start

# Seed database
.PHONY: seed
seed:
	npm run seed

# Docker commands
.PHONY: docker-build
docker-build:
	docker build -t $(DOCKER_IMAGE) .

.PHONY: docker-run
docker-run:
	docker run -p 3000:3000 $(DOCKER_IMAGE)

.PHONY: docker-dev
docker-dev:
	docker-compose up -d

# Deploy
.PHONY: deploy
deploy:
	npm run deploy

# Test
.PHONY: test
test:
	npm test || echo "No test script found"

# Clean
.PHONY: clean
clean:
	rm -rf .next/
	rm -rf node_modules/
	rm -rf data/