"""Eventbrite integration.

Eventbrite doesn't let people search for events via the API anymore, but we can
pull detailed information about an event without the need to scrape IF we can
get an event ID.

So the plan is to scrape the search page on the webstie to get a list of events
which we can then pull information about.

Want to scrape these types of URLs:
https://www.eventbrite.com/d/wa--seattle/music--performances/?page=1

Then pass the parsed event ids into an api call like:
https://www.eventbriteapi.com/v3/events/{event_id}/?expand=ticket_classes,venue,category

Don't forget we need to include the `Authorization: Bearer {token}` header.
"""
import logging
import time
from typing import Generator

import json
import requests

from api.constants import IngestionApis
from api.ingestion.event_apis.event_api import EventApi
from api.models import IngestionRun
from sms_server import settings

logger = logging.getLogger(__name__)

# Looks like the data returned from the backend search call is dumped into
# javascript into a `__SERVER_DATA__` variable. There's a line like this
# `window.__SERVER_DATA__ = {...}`
# We can can grab this line, parse the JSON, and be off to the races.
def event_list_request(page: int=1) -> dict:
  """Get a list of events from Eventbrite by scraping their UI search page."""
  # As it turns out eventbrite has some protections in place to prevent
  # exactly what I'm attempting to do. Unfortunately for them, their protections
  # are dumb. We can bypass stuff by just spoofing a user-agent seems like.
  # Just copying my user agent from Chrome seems to work fine amusingly.
  headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  }
  result = requests.get(f"https://www.eventbrite.com/d/wa--seattle/music--events/?page={page}", headers=headers, timeout=15)
  if result.status_code != 200:
    logger.error(result.status_code)
    logger.error(result.text)

  for line in result.text.split("\n"):
    line = line.strip()
    if not line.startswith("window.__SERVER_DATA__"):
      continue

    # The line ends with a semicolon since it's javascript.
    data = json.loads(line[len("window.__SERVER_DATA__ = "):-1])
    return data
  return {}

class EventbriteApi(EventApi):

  delay: float = 0.5

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.EVENTBRITE)

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    venue_data = raw_data["primary_venue"]

    address = venue_data["address"]["address_1"]
    if venue_data["address"]["address_2"]:
      address += f" {venue_data['address']['address_2']}"

    return {
      "name": venue_data["name"],
      "latitude": venue_data["address"]["latitude"],
      "longitude": venue_data["address"]["longitude"],
      "address": address,
      "postal_code": venue_data["address"]["postal_code"],
      "city": venue_data["address"]["city"],
      "api_id": venue_data["id"],
    }
  
  def get_event_kwargs(self, raw_data: dict) -> dict:
    return {
      "title": raw_data["name"],
      "event_day": raw_data["start_date"],
      "start_time": raw_data["start_time"],
      "event_url": raw_data["url"],
      "event_image_url": raw_data["image"]["url"],
      "description": raw_data.get("summary", "")
    }
  
  def get_raw_data_info(self, raw_data: dict) -> dict:
    return {
      "event_api_id": raw_data["id"],
      "event_name": raw_data["name"],
      "venue_name": raw_data["primary_venue"]["name"],
      "event_day": raw_data["start_date"]
    }

  def get_event_list(self) -> Generator[dict, None, None]:
    """Import data from Eventbrite."""
    data = event_list_request(page=1)
    for event_data in data["search_data"]["events"]["results"]:
      yield event_data
      
    for page in range(2, data["page_count"]):
      data = event_list_request(page=page)
      for event_data in data["search_data"]["events"]["results"]:
        yield event_data
