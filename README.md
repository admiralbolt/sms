# Seattle Music Scene

A website for aggregating information about all open mics and shows in Seattle
in one place.

Website is live at https://seattlemusicscene.info

# Developing

The app is comprised of a backend written in Django and a frontend written in
React. Data is ingested via celery jobs that 1) import data from apis 2) manual
crawl venue websites or 3) generate open mic events based on a fixed schedule.

Running locally involves setting up the following things:

```bash
# 1. Running celery beat. Must be run from the sms/sms_server folder.
celery -A sms_server beat -l DEBUG
# 2. Running the celery worker. Must be run from the sms/sms_server folder.
celery -A sms_server worker -l DEBUG
# 3. Running the backend. Must be run from the sms/sms_server folder.
python manage.py runserver 0.0.0.0:8000
# 4. Running the frontend. Must be run from the sms/sms_frontend folder.
npm start
```
