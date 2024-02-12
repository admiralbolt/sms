"""Dice integration.

Still waiting to hear back from dice about a direct api integration. HOWEVER,
I found their primary api by poking around their site. Event search is done
through a single unprotected endpoint: https://api.dice.fm/unified_search.
"""
import logging
from typing import Iterator

import requests
from scourgify import normalize_address_record

from api.constants import IngestionApis
from api.models import APISample
from api.utils import event_utils, venue_utils

logger = logging.getLogger(__name__)

def event_list_request() -> Iterator[dict]:
  raw_data = requests.post(
    "https://api.dice.fm/unified_search",
    json={
      "lat": 47.6062,
      "lng": -122.3321,
      "tag": "music:gig",
    },
    headers={
      "Content-Type": "application/json"
    }
  ).json()

  # Save the entire raw request as an api sample.
  APISample.objects.create(
    name="All data",
    api_name=IngestionApis.DICE,
    data=raw_data
  )

  for section in raw_data["sections"]:
    for event in section.get("events", []):
      yield event


def process_event(event: dict, debug: bool=False) -> None:
  venue_data = event["venues"][0]
  address_data = normalize_address_record(venue_data["address"])
  venue = venue_utils.create_or_update_venue(
    name=venue_data["name"],
    latitude=venue_data["location"]["lat"],
    longitude=venue_data["location"]["lng"],
    address=address_data["address_line_1"],
    city=venue_data["city"]["name"],
    postal_code=address_data["postal_code"],
    venue_image_url=(venue_data["image"] or {}).get("url", None),
    api_name=IngestionApis.DICE,
    api_id=venue_data["id"],
    debug=debug
  )

  event_day, start_time = event["dates"]["event_start_date"].split("T")
  # Need to remove the -07:00 from the start time.
  start_time = start_time[:8]
  price = (event["price"]["amount"] or event["price"]["amount_from"] or 0) / 100

  event_utils.create_or_update_event(
    venue=venue,
    title=event["name"],
    event_day=event_day,
    start_time=start_time,
    ticket_price_min=price,
    ticket_price_max=price,
    event_api=IngestionApis.DICE,
    event_url=event["social_links"]["event_share"],
    event_image_url=event["images"]["landscape"],
    description=event["about"]["description"]
  )
 

def import_data(debug=False):
  """Import data from dice."""
  for event in event_list_request():
    process_event(event, debug=debug)