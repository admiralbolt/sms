"""Schedulable / repeatable tasks for data gathering and processing."""
import datetime
import logging
from celery import shared_task

from api.ingestion.ingester import Ingester
from api.ingestion.carpenter import Carpenter
from api.models import IngestionRun, OpenMic
from api.utils import open_mic_utils

logger = logging.getLogger(__name__)

@shared_task
def generate_open_mic_events(name_filter: str="", max_diff: datetime.timedelta = datetime.timedelta(days=30), debug: bool=False):
  """Generate events for open mics."""
  if name_filter:
    mic = open_mic_utils.get_open_mic_by_venue_name(name_filter)
    if not mic:
      print(f"Couldn't find open mic with name=({name_filter})")
      return

  open_mics = [mic] if name_filter else OpenMic.objects.all()
  for mic in open_mics:
    # Make sure we only generate events for mics that have a venue attached.
    if not mic.venue:
      continue

    # Make sure we only generate events for mics that have generate_events set.
    if not mic.generate_events:
      continue

    open_mic_utils.generate_open_mic_events(mic, max_diff=max_diff, debug=debug)

@shared_task
def import_and_clean(debug: bool=False):
  """Import data from ALL APIs & Crawlers."""
  ingester = Ingester()
  ingester.import_data()
  carpenter = Carpenter()
  carpenter.run()

@shared_task
def delete_old_ingestion_runs():
  """Delete old ingestion runs to save some space."""
  # Keep ingestion runs for 3 weeks by default.
  delete_threshold = datetime.datetime.now() - datetime.timedelta(days=18)
  for ingestion_run in IngestionRun.objects.filter(created_at__lte=delete_threshold):
    ingestion_run.delete()