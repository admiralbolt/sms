"""Ticketmaster integration."""
import logging
import time

import requests

from api.constants import IngestionApis
from sms_server.api.ingestion.event_api import EventApi
from api.models import IngestionRun
from sms_server import settings

logger = logging.getLogger(__name__)

def event_list_request(page: int=0) -> dict:
  """Get event data from Ticketmaster."""
  return requests.get(f"https://app.ticketmaster.com/discovery/v2/events?apikey={settings.TICKET_MASTER_API_KEY}&radius=10&unit=miles&segmentName=Music&geoPoint=c22zp&page={page}", timeout=15).json()

def select_image(images: list[dict]) -> str:
  """Select an image from the tickemaster image response.

  List of images looks like =>
  [{
    'fallback': True/False,
    'height': xxx,
    'ratio': '16_9',
    'url': '...',
    'width': xxx
  }, ...]

  We prefer 16_9 ratio, then 3_2 ratio, and want to grab the largest image
  possible.
  """
  if not images:
    return ""

  ratio_priority = {
    '16_9': 3,
    '3_2': 2,
    '4_3': 1
  }
  max_index = -1
  max_prio = -1
  max_width = -1
  for i, image in enumerate(images):
    priority = ratio_priority.get(image.get("ratio", "who the fuck knows"), 0)
    if priority < max_prio or image["width"] < max_width:
      continue

    max_index = i
    max_prio = priority
    max_width = image["width"]

  return images[max_index]["url"]

class TicketmasterApi(EventApi):

  delay: float = 0.5

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.TICKETMASTER)

  def get_venue_kwargs(self, event_data: dict) -> dict:
    if len(event_data["_embedded"]["venues"]) > 1:
      logger.warning("Multiple venues returned within single event. Full data:")
      logger.warning(event_data)

    venue_data = event_data["_embedded"]["venues"][0]
    return {
      "name": venue_data["name"],
      "latitude": venue_data["location"]["latitude"],
      "longitude": venue_data["location"]["longitude"],
      "address": ", ".join([venue_data["address"][line] for line in sorted(venue_data["address"].keys())]),
      "postal_code": venue_data["postalCode"],
      "city": venue_data["city"]["name"],
      "api_id": venue_data["id"],
    }
  
  def get_event_kwargs(self, event_data: dict) -> dict:
    return {
      "title": event_data["name"],
      "event_day": event_data["dates"]["start"]["localDate"],
      "start_time": event_data["dates"]["start"].get("localTime", None),
      "event_url": event_data["url"],
      "event_image_url": select_image(event_data["images"])
    }
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    events = event_list_request(page=0)
    if "_embedded" not in events:
      logger.warning(f"Empty events list: {events}, while ingesting from Ticketmaster.")
      return
    
    num_pages = events["page"]["totalPages"]
    for event_data in events["_embedded"]["events"]:
      self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
    
    for page in range(1, num_pages):
      # We are only allowed a maximum of 5 QPS worth of traffic, so we insert
      # an artificial delay between requests to avoid hitting it.
      time.sleep(self.delay)
      events = event_list_request(page=page)
      if "_embedded" not in events:
        logger.warning(f"Empty events list: {events}, while ingesting from Ticketmaster.")
        continue

      for event_data in events["_embedded"]["events"]:
        self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
  
