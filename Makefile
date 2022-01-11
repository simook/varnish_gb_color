build:
	npx tsc

server: build
	npm run start
	