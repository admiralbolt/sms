"""Ingest data from TIXR.

TIXR is only used by two venues, Nectar and High dive. The only reason I'm
accessing the API and not scraping those venues is because they are leaking
their client key in the frontend.
"""
from datetime import datetime

import requests

from api.constants import IngestionApis
from sms_server.api.ingestion.event_api import EventApi
from api.models import IngestionRun
from sms_server import settings

def event_list_request(venue_id: str="", client_key: str=""):
  """List all events for a particular venue."""
  headers = {
    "Content-Type": "application/json",
  }
  return requests.get(f"https://tixr.com/v1/groups/{venue_id}/events?cpk={client_key}", headers=headers, timeout=15).json()

class TIXRApi(EventApi):

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.TIXR)

  def get_event_detail(self, event_id: str) -> dict:
    return {}

  def get_venue_kwargs(self, event_data: dict) -> dict:
    return {
      "name": event_data["venue"]["name"],
      "api_id": event_data["venue"]["id"]
    }
  
  def get_event_kwargs(self, event_data: dict) -> dict:
    absolute_start = datetime.fromtimestamp(event_data["start_date"] / 1000)
    return {
      "title": event_data["name"],
      "event_day": absolute_start.strftime("%Y-%m-%d"),
      "start_time": absolute_start.strftime("%H:%M"),
      "event_url": event_data["url"],
      "event_image_url": event_data.get("flyer_url", ""),
      "description": event_data["description"],
    }
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    for venue_name, venue_id, client_key in settings.TIXR_CLIENTS:
      event_list = event_list_request(venue_id=venue_id, client_key=client_key)

      for event in event_list:
        self.process_event(ingestion_run=ingestion_run, event_data=event, debug=debug)
