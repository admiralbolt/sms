"""Schedulable / repeatable tasks for data gathering and processing."""
import datetime
import json
import logging
import os

import requests
from celery import shared_task

from api.constants import AUTOMATIC_APIS, IngestionApis
from api.ingestion import axs, dice, eventbrite, ticketmaster, tixr, venuepilot
from sms_server.api.ingestion.event_api import EventApi
from api.models import IngestionRun, OpenMic
from api.utils import open_mic_utils, venue_utils
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
def import_api_data(api_name: str, ingestion_run: IngestionRun, debug: bool=False):
  """Import data from apis!"""
  ingester_dict: dict[str, EventApi] = {
    IngestionApis.AXS: axs.AXSApi,
    IngestionApis.DICE: dice.DiceApi,
    IngestionApis.EVENTBRITE: eventbrite.EventbriteApi,
    IngestionApis.TICKETMASTER: ticketmaster.TicketmasterApi,
    IngestionApis.TIXR: tixr.TIXRApi,
    IngestionApis.VENUEPILOT: venuepilot.VenuepilotApi,
  }

  if api_name not in ingester_dict:
    print("Invalid api name specified.")
    return
  
  ingester = ingester_dict[api_name]()
  ingester.import_data(ingestion_run=ingestion_run, debug=debug)

@shared_task
def crawl_data(crawler_name: str, ingestion_run: IngestionRun, debug: bool=False):
  """Crawl data from individual venues!"""
  crawler = venue_utils.get_crawler(crawler_module_name=crawler_name)
  if crawler is None:
    print(f"Crawler {crawler_name} does not exist.")
    return

  crawler.import_data(ingestion_run=ingestion_run, debug=debug)

@shared_task
def import_all(debug: bool=False):
  """Import data from ALL APIs."""
  ingestion_run = IngestionRun.objects.create(name="Full Run")
  for api_name in AUTOMATIC_APIS:
    try:
      import_api_data(api_name=api_name, ingestion_run=ingestion_run, debug=debug)
    except Exception as e:
      logger.warning("[INGESTER_FAILED] API: %s, error: %s", api_name, e)
  # Run all the crawlers.
  # venue_apis = VenueApi.objects.filter(api_name=IngestionApis.CRAWLER)
  # for venue_api in venue_apis:
  #   crawl_data(crawler_name=venue_api.crawler_name, ingestion_run=ingestion_run, debug=debug)

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