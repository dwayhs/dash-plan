.PHONY: setup run test pack dist dist-mac dist-win dist-linux

setup:
	npm install

run:
	npm start

test:
	npm run test

pack:
	npm run pack

clean-dist:
	rm -rf dist

dist: clean-dist dist-mac dist-win dist-linux

dist-mac:
	npm run dist-mac

dist-win:
	npm run dist-win

dist-linux:
	npm run dist-linux

