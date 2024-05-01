# Deployment Configs

Configuration files used on the server. Backing these
up to the repo in case something goes horribly wrong.

The nginx configs come from `/etc/nginx/sites-available/`

The celery configs come from two places:

1.  `/etc/default/celeryd`
2.  Service files are located in: `/etc/systemd/system/[celery].service`
