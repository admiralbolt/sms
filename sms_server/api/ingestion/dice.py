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
from api.ingestion.ingester import Ingester
from api.models import IngestionRun

logger = logging.getLogger(__name__)

def event_list_request() -> Iterator[dict]:
  raw_data = requests.post(
    "https://api.dice.fm/unified_search",
    json={
      "lat": 47.6062,
      "lng": -122.3321,
      "tag": "music:gig",
      "count": 200,
    },
    headers={
      "Content-Type": "application/json"
    }
  ).json()

  for section in raw_data["sections"]:
    for event in section.get("events", []):
      yield event


class DiceIngester(Ingester):

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.DICE)

  def get_event_detail(self, event_id: str) -> dict:
    return {}

  def get_venue_kwargs(self, event_data: dict) -> dict:
    venue_data = event_data["venues"][0]
    address_data = normalize_address_record(venue_data["address"])
    return {
      "name": venue_data["name"],
      "latitude": venue_data["location"]["lat"],
      "longitude": venue_data["location"]["lng"],
      "address": address_data["address_line_1"],
      "city": venue_data["city"]["name"],
      "postal_code": address_data["postal_code"],
      "venue_image_url": (venue_data["image"] or {}).get("url", None),
      "api_id": venue_data["id"]
    }

  def get_event_kwargs(self, event_data: dict) -> dict:
    event_day, start_time = event_data["dates"]["event_start_date"].split("T")
    # Need to remove the -07:00 from the start time.
    start_time = start_time[:8]
    return {
      "title": event_data["name"],
      "event_day": event_day,
      "start_time": start_time,
      "event_url": event_data["social_links"]["event_share"],
      "event_image_url": event_data["images"]["landscape"],
      "description": event_data["about"]["description"]
    }
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    for event in event_list_request():
      self.process_event(ingestion_run=ingestion_run, event_data=event, debug=debug)