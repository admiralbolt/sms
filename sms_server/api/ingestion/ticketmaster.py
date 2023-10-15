"""Ticketmaster integration."""
import time
from pprint import pprint

import requests

from api.utils import event_utils, venue_utils
from sms_server import settings

def event_request(page: int=0):
  """Get event data from Ticketmaster."""
  return requests.get(f"https://app.ticketmaster.com/discovery/v2/events?apikey={settings.TICKET_MASTER_API_KEY}&radius=10&unit=miles&segmentName=Music&geoPoint=c22zp&page={page}", timeout=15).json()

def get_or_create_venue(data):
  """Get or create a venue."""
  if len(data["_embedded"]["venues"]) > 1:
    print("HUH")
    pprint(data)

  venue_data = data["_embedded"]["venues"][0]
  return venue_utils.get_or_create_venue(
    name=venue_utils.get_proper_name(venue_data["name"]),
    latitude=venue_data["location"]["latitude"],
    longitude=venue_data["location"]["longitude"],
    address=", ".join([venue_data["address"][line] for line in sorted(venue_data["address"].keys())]),
    postal_code=venue_data["postalCode"],
    city=venue_data["city"]["name"],
    venue_api="Ticketmaster",
    venue_api_id=venue_data["id"]
  )


def process_event_list(events) -> None:
  """Process list of Ticketmaster events."""
  if "_embedded" not in events:
    pprint(events)
    print("========\n\n\n\n\n\n\n\n")
    return

  for event in events["_embedded"]["events"]:
    # Create venues based on the shows first.
    venue = get_or_create_venue(event)
    if not venue.gather_data:
      continue

    event_utils.get_or_create_event(
      venue=venue,
      title=event["name"],
      event_day=event["dates"]["start"]["localDate"],
      start_time=event["dates"]["start"].get("localTime", None),
      ticket_price_min=0 if "priceRanges" not in event else event["priceRanges"][0]["min"],
      ticket_price_max=0 if "priceRanges" not in event else event["priceRanges"][0]["max"],
    )


def import_data(delay: float=0.2) -> None:
  """Import data from Ticketmaster."""
  events = event_request(page=0)
  num_pages = events["page"]["totalPages"]
  print(f"Expecting a total of {events['page']['size'] * num_pages} events.")
  process_event_list(events)
  for page in range(1, num_pages):
    # We are only allowed a maximum of 5 QPS worth of traffic, so we insert
    # an artificial delay between requests to avoid hitting it.
    time.sleep(delay)
    events = event_request(page=page)
    process_event_list(events)
