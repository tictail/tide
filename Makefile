.PHONY: install regions build clean test release

install:
	npm prune
	npm install

build:
	./node_modules/.bin/webpack

clean:
	rm -rf build

test:
	make build
	node_modules/.bin/mocha-phantomjs build/tests.html

release:
	@./release.sh
