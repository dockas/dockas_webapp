# Webapp SSL server definition
server {
    listen                      80;
    listen                      443 ssl;
    listen                      8081;
    server_name                 localhost dockas.dev;

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

    location /v1/billing/notifications {
        rewrite /v1/billing/(.*) /$1  break;
        proxy_pass              http://localhost:9595;
    }

    location /v1/ {
        proxy_pass              http://localhost:9898/;
    }
}

# File server definition
server {
    listen                      80;
    server_name                 file.dockas.dev;

    client_max_body_size 10M;
    add_header Access-Control-Allow-Origin *;

    root                        PWD_PATH/../api_rest/files;
}

# Socket SSL server definition
server {
    listen                      80;
    listen                      443 ssl;
    server_name                 socket.dockas.dev;

    ssl_certificate             PWD_PATH/.ssl/fullchain.pem;
    ssl_certificate_key         PWD_PATH/.ssl/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        
        proxy_pass              http://localhost:9898/;
    }
}