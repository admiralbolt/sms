"""Ticketmaster integration."""
import logging
import time
from pprint import pprint

import requests

from api.constants import IngestionApis
from api.models import APISample
from api.utils import event_utils, venue_utils
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

def get_or_create_venue(data, debug: bool=False):
  """Get or create a venue."""
  if len(data["_embedded"]["venues"]) > 1:
    logger.error(f"Multiple venues returned within single event. Full data:")
    logger.error(data)

  venue_data = data["_embedded"]["venues"][0]
  return venue_utils.get_or_create_venue(
    name=venue_data["name"],
    latitude=venue_data["location"]["latitude"],
    longitude=venue_data["location"]["longitude"],
    address=", ".join([venue_data["address"][line] for line in sorted(venue_data["address"].keys())]),
    postal_code=venue_data["postalCode"],
    city=venue_data["city"]["name"],
    api_name="Ticketmaster",
    api_id=venue_data["id"],
    debug=debug,
  )


def process_event_list(events, debug: bool=False) -> None:
  """Process list of Ticketmaster events."""
  if "_embedded" not in events:
    logger.warn(f"Empty events list: {events}")
    return

  for event in events["_embedded"]["events"]:
    # Create venues based on the shows first.
    venue = get_or_create_venue(event, debug=debug)
    if not venue.gather_data:
      continue

    event_utils.create_or_update_event(
      venue=venue,
      title=event["name"],
      event_day=event["dates"]["start"]["localDate"],
      start_time=event["dates"]["start"].get("localTime", None),
      ticket_price_min=0 if "priceRanges" not in event else event["priceRanges"][0]["min"],
      ticket_price_max=0 if "priceRanges" not in event else event["priceRanges"][0]["max"],
      event_api=IngestionApis.TICKETMASTER,
      event_url=event["url"],
      event_image_url=select_image(event["images"]),
    )


def import_data(delay: float=0.2, debug=False) -> None:
  """Import data from Ticketmaster."""
  events = event_list_request(page=0)
  # Save the response from the first page.
  APISample.objects.create(
    name="All data page 1",
    api_name=IngestionApis.TICKETMASTER,
    data=events
  )
  num_pages = events["page"]["totalPages"]
  process_event_list(events, debug=debug)
  for page in range(1, num_pages):
    # We are only allowed a maximum of 5 QPS worth of traffic, so we insert
    # an artificial delay between requests to avoid hitting it.
    time.sleep(delay)
    events = event_list_request(page=page)
    process_event_list(events, debug=debug)
