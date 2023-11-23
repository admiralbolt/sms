"""Celery is good for you. Also used to schedule tasks."""
import os

import django
from celery import Celery
from celery.schedules import crontab

from api.tasks import generate_open_mic_events, import_all

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sms_server.settings")
django.setup()

app = Celery("sms_server")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
  """Setup periodic jobs to crawl & generate events."""
  # Import all data everyday at 3am.
  sender.add_periodic_task(crontab(hour=3, minute=0), import_all, name="Import Data")
  # Generate open mic events once a week, sunday at 1am.
  sender.add_periodic_task(crontab(day_of_week="sun", hour=1, minute=0), generate_open_mic_events, name="Generate Open Mics")
