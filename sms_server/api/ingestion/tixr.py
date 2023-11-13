"""Ingest data from TIXR.

TIXR is only used by two venues, Nectar and High dive. The only reason I'm
accessing the API and not scraping those venues is because they are leaking
their client key in the frontend.
"""
from datetime import datetime

import requests

from api.constants import IngestionApis
from api.models import APISample
from api.utils import event_utils, venue_utils
from sms_server import settings

def event_list_request(venue_id: str="", client_key: str=""):
  """List all events for a particular venue."""
  headers = {
    "Content-Type": "application/json",
  }
  return requests.get(f"https://tixr.com/v1/groups/{venue_id}/events?cpk={client_key}", headers=headers, timeout=15).json()

def process_event_list(event_list: list[dict], debug: bool=False) -> None:
  """Process list of events from TIXR."""
  for event in event_list:
    venue = venue_utils.get_or_create_venue(
      name=event["venue"]["name"],
      api_name="TIXR",
      api_id=event["venue"]["id"],
      debug=debug,
    )

    absolute_start = datetime.fromtimestamp(event["start_date"] / 1000)
    event_utils.create_or_update_event(
      venue=venue,
      title=event["name"],
      event_day=absolute_start.strftime("%Y-%m-%d"),
      start_time=absolute_start.strftime("%H:%M"),
      ticket_price_min=event.get("current_price", 0),
      ticket_price_max=event.get("current_price", 0),
      event_api=IngestionApis.TIXR,
      event_url=event["url"],
      description=event["description"],
    )

def import_data(debug=False):
  """Import data from TIXR."""
  for venue_name, venue_id, client_key in settings.TIXR_CLIENTS:
    data = event_list_request(venue_id=venue_id, client_key=client_key)
    # Save the response from the first page.
    APISample.objects.create(
      name=f"{venue_name} ALL Data",
      api_name=IngestionApis.TIXR,
      data=data
    )
    process_event_list(data, debug=debug)
