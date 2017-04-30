# Webapp SSL server definition
server {
    listen                      80;
    listen                      443 ssl;
    server_name                 dockas.dev;

    ssl_certificate             PWD_PATH/.ssl/fullchain.pem;
    ssl_certificate_key         PWD_PATH/.ssl/privkey.pem;

    client_max_body_size 10M;
    add_header Access-Control-Allow-Origin *;

    root                        PWD_PATH/dist;
    index                       index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires         10m;
        log_not_found   off;
        add_header      Pragma public;
        add_header      Cache-Control "public, must-revalidate, proxy-revalidate";
    }

    location /favicon.ico {
        log_not_found off;
    }
}

# API SSL server definition
server {
    listen                      80;
    listen                      443 ssl;
    server_name                 api.dockas.dev;

    ssl_certificate             PWD_PATH/.ssl/fullchain.pem;
    ssl_certificate_key         PWD_PATH/.ssl/privkey.pem;

    client_max_body_size 10M;

    location /v1/ {
        proxy_pass              http://localhost:9898/;
    }
}

# File server definition
server {
    listen                      80;
    server_name                 file.dockas.dev;

    root                        PWD_PATH/../api_rest/files;
}