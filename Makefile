.PHONY: frontend-dev frontend-build backend-dev backend-build

frontend-dev:
	bash scripts/dev-frontend.sh

frontend-build:
	bash scripts/build-frontend.sh

backend-dev:
	bash scripts/dev-backend.sh

backend-build:
	bash scripts/build-backend.sh
