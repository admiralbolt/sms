"""Celery is good for you. Also used to schedule tasks."""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sms_server.settings")
django.setup()

from celery import Celery
from celery.schedules import crontab

from api.tasks import delete_old_ingestion_runs, run_carpenter, run_ingester, run_janitor


app = Celery("sms_server")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
  """Setup periodic jobs to crawl & generate events."""
  # Really we could be doing this by setting up task dependencies somehow, but
  # couldn't figure it out from the celery docs and this'll work well enough.
  # Run the ingester everyday at 1am.
  sender.add_periodic_task(crontab(hour=1, minute=0), run_ingester, name="Ingester Cron")
  # Wait a few hours, then run the carpenter.
  sender.add_periodic_task(crontab(hour=5, minute=0), run_carpenter, name="Carpenter Cron")
  # Wait an hour, then run the janitor.
  sender.add_periodic_task(crontab(hour=6, minute=0), run_janitor, name="Janitor Cron")
  # Delete old ingestion runs once a day.
  sender.add_periodic_task(crontab(hour=7, minute=0), delete_old_ingestion_runs, name="Delete Old Ingestion Runs")
