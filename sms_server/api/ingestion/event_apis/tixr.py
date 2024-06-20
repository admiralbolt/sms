"""Ingest data from TIXR.

TIXR is only used by two venues, Nectar and High dive. The only reason I'm
accessing the API and not scraping those venues is because they are leaking
their client key in the frontend.
"""
from datetime import datetime
from typing import Generator

import requests

from api.constants import IngestionApis
from api.ingestion.event_apis.event_api import EventApi
from sms_server import settings

def event_list_request(venue_id: str="", client_key: str=""):
  """List all events for a particular venue."""
  headers = {
    "Content-Type": "application/json",
  }
  return requests.get(f"https://tixr.com/v1/groups/{venue_id}/events?cpk={client_key}", headers=headers, timeout=15).json()

class TIXRApi(EventApi):

  has_artists = True

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.TIXR)

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    return {
      "name": raw_data["venue"]["name"],
      "api_id": raw_data["venue"]["id"]
    }
  
  def get_event_kwargs(self, raw_data: dict) -> dict:
    absolute_start = datetime.fromtimestamp(raw_data["start_date"] / 1000)
    return {
      "title": raw_data["name"],
      "event_day": absolute_start.strftime("%Y-%m-%d"),
      "start_time": absolute_start.strftime("%H:%M"),
      "event_url": raw_data["url"],
      "event_image_url": raw_data.get("flyer_url", ""),
      "description": raw_data["description"],
    }
  
  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    for act in raw_data["lineups"]["acts"]:
      yield {
        "name": act["artist"]["name"]
      }
  
  def get_raw_data_info(self, raw_data: dict) -> dict:
    absolute_start = datetime.fromtimestamp(raw_data["start_date"] / 1000)
    return {
      "event_api_id": raw_data["id"],
      "event_name": raw_data["name"],
      "venue_name": raw_data["venue"]["name"],
      "event_day": absolute_start.strftime("%Y-%m-%d"),
    }
  
  def get_event_list(self) -> Generator[dict, None, None]:
    for _, venue_id, client_key in settings.TIXR_CLIENTS:
      event_list = event_list_request(venue_id=venue_id, client_key=client_key)

      for event in event_list:
        yield event
