# Dockas Web App

This repo implements a web application for Dockas project. 

To run it, first clone the repo recursivelly using:

```
git clone --recursive git@github.com:dockas/dockas_webapp.git
```

Then you gonna need to configure a web server like Nginx to provide files in `dockas.dev` endpoint using SSL to enable geolocation feature in browsers like Chrome (yes, this sucks). Generate a SSL self signed certificate and the nginx configuration file running:

```bash
make nginx
```

You need to include the `nginx.conf` file generated in this repo to your own nginx configuration (normally located at `/etc/nginx/nginx.conf` in linux machines or `/usr/local/etc/nginx/nginx.conf` for Mac users who installed it via homebrew). To do so, just add the following line to your nginx configuration file:

```
include PATH/TO/dockas_webapp/nginx.conf;
```

Finally, reload nginx config running:

```
nginx -s reload
```

and add these lines to your `/etc/hosts` file:

```
127.0.0.1    dockas.dev
127.0.0.1    api.dockas.dev
```

Now you can install webapp dependencies running:

```bash
npm install
```

And start it in development mode running:

```
make dev
```

Open an web browser and go to `dockas.dev`. Cheers! :)