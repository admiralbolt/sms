"""Schedulable / repeatable tasks for data gathering and processing."""
import datetime
import json
import logging
import os

import requests
from celery import shared_task

from api.ingestion.ingester import Ingester
from api.models import IngestionRun, OpenMic
from api.utils import open_mic_utils
from sms_server.settings import IS_PROD, MEDIA_ROOT

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
def import_all(debug: bool=False):
  """Import data from ALL APIs & Crawlers."""
  ingester = Ingester()
  ingester.import_data()

@shared_task
def write_latest_data():
  """Write latest data for events and venues to a flat file."""
  # On plane so can't google, will eventually need to get a server name in
  # here somewhere to distinguish localhost / prod. For now we hardcode to
  # localhost.
  base_url = "http://localhost" if not IS_PROD else "https://seattlemusicscene.info"
  venues_request = requests.get(f"{base_url}:8000/api/venues")
  all_venues = venues_request.json()
  with open(os.path.join(MEDIA_ROOT, "latest_venues.json"), "w") as wh:
    json.dump(all_venues, wh)

  events_request = requests.get(f"{base_url}:8000/api/events")
  all_events = events_request.json()
  with open(os.path.join(MEDIA_ROOT, "latest_events.json"), "w") as wh:
    json.dump(all_events, wh)

@shared_task
def delete_old_ingestion_runs():
  """Delete old ingestion runs to save some space."""
  # Keep ingestion runs for 3 weeks by default.
  delete_threshold = datetime.datetime.now() - datetime.timedelta(days=18)
  for ingestion_run in IngestionRun.objects.filter(created_at__lte=delete_threshold):
    ingestion_run.delete()