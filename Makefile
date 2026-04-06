.PHONY: frontend-dev frontend-build backend-dev backend-build static-generate frontend-static-build

frontend-dev:
	bash scripts/dev-frontend.sh

frontend-build:
	bash scripts/build-frontend.sh

static-generate:
	bash scripts/generate-static-data.sh

frontend-static-build: static-generate frontend-build

backend-dev:
	bash scripts/dev-backend.sh

backend-build:
	bash scripts/build-backend.sh
