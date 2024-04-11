# Seattle Music Scene

A website for aggregating information about all open mics and shows in Seattle
in one place.

Website is live at https://seattlemusicscene.info

# Developing

The app is comprised of a backend written in Django and a frontend written in
React. Data is ingested via celery jobs that 1) import data from apis 2) manual
crawl venue websites or 3) generate open mic events based on a fixed schedule.

The full setup involves running the following 4 things:

```bash
# 1. Running celery beat. Must be run from the sms/sms_server folder.
celery -A sms_server beat -l DEBUG
# 2. Running the celery worker. Must be run from the sms/sms_server folder.
celery -A sms_server worker -l DEBUG
# 3. Running the backend. Must be run from the sms/sms_server folder.
python manage.py runserver 0.0.0.0:8000
# 4. Running the frontend. Must be run from the sms/sms_frontend folder.
npm run dev
```

Running the celery workers is only necessary if you want to periodically crawl
data in your dev setup. Otherwise, running the server via `python manage.py ...`
and running the frontend via `npm run dev` is all that's necessary.

To get some data into your db, you'll need to run some management commands =>

```bash
# 1. Import all data from the automatic apis!
python manage.py import_api_data --all
# 2. Import all data from the cralwers!
python manage.py crawl_data --all
# 3. Generate open mic night events!
python manage.py generate_open_mic_events
# 4. Write the data to a flat file used by the frontend!
python manage.py write_latest_data
```

If you steal a copy of data from the db in production, don't forget to run
the `python manage.py write_latest_data` command!