test:
	expresso test/unit/*.test.js

run:
	node server.js

.PHONY: test