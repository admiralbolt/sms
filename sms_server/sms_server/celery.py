"""Celery is good for you. Also used to schedule tasks."""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sms_server.settings")
django.setup()

from celery import Celery
from celery.schedules import crontab

from api.tasks import generate_open_mic_events, import_and_clean, delete_old_ingestion_runs


app = Celery("sms_server")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
  """Setup periodic jobs to crawl & generate events."""
  # Import all data everyday at 3am.
  sender.add_periodic_task(crontab(hour=3, minute=0), import_and_clean, name="Import & Clean Data")
  # Delete old ingestion runs once a day.
  sender.add_periodic_task(crontab(hour=2, minute=0), delete_old_ingestion_runs, name="Delete Old Ingestion Runs")
