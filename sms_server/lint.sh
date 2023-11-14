#!/bin/bash

PYTHONPATH=. DJANGO_SETTINGS_MODULE=sms_server.sms_server.settings pylint --load-plugins pylint_django *
