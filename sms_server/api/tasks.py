"""Schedulable / repeatable tasks for data gathering and processing."""
import datetime

from celery import shared_task

from api.constants import AUTOMATIC_APIS, IngestionApis
from api.models import OpenMic, VenueApi
from api.ingestion import axs, eventbrite, ticketmaster, tixr, venuepilot
from api.ingestion.crawlers import skylark
from api.utils import open_mic_utils, venue_utils

@shared_task
def generate_open_mic_events(name_filter: str="", max_diff: datetime.timedelta = datetime.timedelta(days=45), debug: bool=False):
  """Generate events for open mics."""
  if name_filter:
    mic = open_mic_utils.get_open_mic_by_venue_name(name_filter)
    if not mic:
      print(f"Couldn't find open mic with name = {name_filter}")
      return

  open_mics = [mic] if name_filter else OpenMic.objects.all()
  for mic in open_mics:
    # Make sure we only generate events for mics that have a venue attached.
    if not mic.venue:
      continue
    open_mic_utils.generate_open_mic_events(mic, max_diff=max_diff)


@shared_task
def import_data(api_name: str, debug: bool=False):
  import_call_dict = {
    IngestionApis.AXS: axs.import_data,
    IngestionApis.EVENTBRITE: eventbrite.import_data,
    IngestionApis.TICKETMASTER: ticketmaster.import_data,
    IngestionApis.TIXR: tixr.import_data,
    IngestionApis.VENUEPILOT: venuepilot.import_data,
  }

  if api_name not in import_call_dict:
    print("Invalid api name specified.")
    return

  import_call_dict[api_name](debug=debug)

@shared_task
def crawl_data(crawler_name: str, debug: bool=False):
  venue, crawl_method = venue_utils.get_crawler_info(crawler_name=crawler_name)
  if venue is None:
    print(f"Couldn't find venue information for crawler {crawler_name}")

  crawl_method(venue=venue, debug=debug)

@shared_task
def import_all(debug: bool=False):
  """Import data from ALL APIs."""
  for api_name in AUTOMATIC_APIS:
    import_data(api_name=api_name, debug=debug)
  # Run all the crawlers.
  venue_apis = VenueApi.objects.filter(api_name=IngestionApis.CRAWLER)
  for venue_api in venue_apis:
    crawl_method = venue_utils.get_crawl_function(venue_api.crawler_name)
    crawl_method(venue=venue_api.venue, debug=debug)
