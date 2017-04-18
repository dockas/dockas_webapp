NODE_PATH:=.
dirname := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

.PHONY: prod stage dev test nginx

prod:
	NODE_PATH=${NODE_PATH} NODE_ENV=production gulp

stage:
	NODE_PATH=${NODE_PATH} NODE_ENV=stage gulp

dev:
	NODE_PATH=${NODE_PATH} NODE_ENV=development gulp

test:
	NODE_PATH=${NODE_PATH} NODE_ENV=test gulp

bash:
	bash

init:
	git submodule update --recursive --remote

update:
	git submodule foreach git pull origin master

icomoon:
	chmod -R 755 ./src/assets/icons/icomoon

nginx:
	@if [ ! -d ./.ssl ]; then \
		echo ">> generating ssl"; \
		mkdir -p ./.ssl; \
		openssl genrsa 8192 > ./.ssl/ca.key; \
		openssl req -x509 -new -nodes -key ./.ssl/ca.key -days 3650 -subj "/C=BR/ST=Minas Gerais/L=Belo Horizonte/O=Nosebit/OU=IT Department/CN=LeroBox" > ./.ssl/ca.pem; \
		openssl genrsa 4096 > ./.ssl/privkey.pem; \
		openssl req -new -key ./.ssl/privkey.pem -subj "/C=BR/ST=Minas Gerais/L=Belo Horizonte/O=Nosebit/OU=IT Department/CN=lerobox.dev" > ./.ssl/dev.csr; \
		openssl x509 -req -days 3600 -CA ./.ssl/ca.pem -CAkey ./.ssl/ca.key -CAcreateserial -in ./.ssl/dev.csr -extfile ./dev.ssl.extensions -extensions dev > ./.ssl/fullchain.pem; \
	fi

	sed 's,PWD_PATH,$(dirname),g' nginx.conf.tpl > nginx.conf;
