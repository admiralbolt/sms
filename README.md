# Seattle Music Scene

A website for aggregating information about all open mics and shows in Seattle
in one place.

Website is live at https://seattlemusicscene.info

# Dev Setup

Get the code!
 ```bash
 git clone git@github.com:<USERNAME>/sms.git
 ```

## Server Setup

Then, we setup the server side of things. The server runs on Python Version=3.9,
so to install packages correctly we need to be running that version of python.
Either [venv](https://virtualenv.pypa.io/en/latest/) or [miniconda](https://docs.anaconda.com/free/miniconda/index.html)
works for this.

Once you have a Python 3.9 environment setup, we can install the necessary libraries from
the `requirements.txt` file provided in the `sms_server` directory.

```bash
cd sms/sms_server/
pip install -r requirements.txt
```

Next, we need to setup a `local_settings.py` file that should live next to the
`settings.py` file. The full path from root: `sms/sms_server/sms_server/local_settings.py`.
This is for various configuration settings and keys that shouldn't be
committed directly to the repo.

> [!NOTE]
> To get functional api keys reach out to me, I guess.

Here's what that file should look like =>

```python
"""Local Settings. DONT COMMIT THESE YOU FUCK."""

BANDSINTOWN_APP_ID = "REDACTED"
EVENTBRITE_TOKEN = "REDACTED"
TICKET_MASTER_API_KEY = "REDACTED"
TIXR_CLIENTS = [
  ("Nectar Lounge", "748", "REDACTED"),
  ("High Dive", "749", "REDACTED")
]
MEDIA_ROOT = "/Some/local/path/of/your/choosing"
IS_PROD = False
```

This is a necessary first step to run `manage.py` commands because
otherwise the `settings.py` file will be sad.

Now we can get our db setup!

```bash
# Create the DB and stuff
python manage.py migrate
# Give ourselves admin access!
python manage.py createsuperuser
```

At this point we can check our work by running the server, and trying to access
the admin page or any of the rest api endpoints.

```bash
# Run the server!
python manage.py runserver 0.0.0.0:8000
```

The admin panel is located at [http://localhost:8000/admin](http://localhost:8000/admin) and you can
browse the rest api by looking at [http://localhost:8000/api](http://localhost:8000/api)

Right now everything should be empty!
We can fix that by running management commands to import data.

> [!WARNING]
> You need functional api keys to import data.
> Also the api import takes ~45 minutes.

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

Now we should be able to see some data in both the admin panel and the rest api!
Huzzah!

## Frontend Setup

## Celery Setup

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
