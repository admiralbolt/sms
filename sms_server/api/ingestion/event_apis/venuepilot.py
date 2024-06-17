"""Ingest data from Venupilot.

Venuepilot doesn't have any sort of search scope features, so we query all
events and then filter by city accordingly.
"""
from datetime import datetime
from typing import Any, Optional

import requests

from api.constants import IngestionApis
from sms_server.api.ingestion.event_api import EventApi
from api.models import IngestionRun

REQUEST_TEMPLATE = """
query PaginatedEvents {
    paginatedEvents(arguments: {limit: 20, page: %d, startDate: "%s"}) {
      collection {
        date
        description
        doorTime
        endTime
        footerContent
        highlightedImage
        id
        images
        instagramUrl
        minimumAge
        name
        promoter
        startTime
        status
        support
        ticketsUrl
        twitterUrl
        websiteUrl
        venue {
          id
          name
          street1
          street2
          state
          postal
          city
          country
          lat
          long
          timeZone
        }
        artists {
          id
          name
          updatedAt
          createdAt
          bio
        }
        scheduling
        provider
        priceMin
        priceMax
        currency
      }
      metadata {
        totalCount
        totalPages
        currentPage
        limitValue
      }
    }
    publicEvents {
      id
    }
  }
"""

def event_list_request(min_start_date: Optional[str]=None, page: int=0):
  """Get a list of events from Venuepilot."""
  min_start_date = min_start_date or datetime.today().strftime("%Y-%m-%d")
  headers = {
    "Content-Type": "application/json"
  }
  data = {
    "operationName": "PaginatedEvents",
    "query": REQUEST_TEMPLATE % (page, min_start_date)
  }
  return requests.post("https://www.venuepilot.co/graphql", headers=headers, json=data, timeout=30).json()

class VenuepilotApi(EventApi):

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.VENUEPILOT)

  def get_venue_kwargs(self, event_data: dict) -> dict:
    venue_data = event_data["venue"]
    address = venue_data["street1"]
    if venue_data["street2"]:
      address += f" {venue_data['street2']}"
    return {
      "name": venue_data["name"],
      "latitude": venue_data["lat"],
      "longitude": venue_data["long"],
      "address": address,
      "postal_code": venue_data["postal"],
      "city": venue_data["city"],
      "api_id": venue_data["id"],
    }
  
  def get_event_kwargs(self, event_data: dict) -> dict:
    return {
      "title": event_data["name"],
      "event_day": event_data["date"],
      "start_time": event_data["startTime"],
      "event_url": event_data["ticketsUrl"],
      "description": event_data["description"],
      "event_image_url": event_data["highlightedImage"],
    }
  
  def process_event_list(self, ingestion_run: IngestionRun, event_list: list[dict], debug: bool=False):
    for event_data in event_list["data"]["paginatedEvents"]["collection"]:
      if event_data["venue"]["city"].lower() != "seattle":
        continue
      self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    event_list = event_list_request(page=0)
    total_pages = event_list["data"]["paginatedEvents"]["metadata"]["totalPages"]
    self.process_event_list(ingestion_run=ingestion_run, event_list=event_list, debug=debug)
    for page in range(1, total_pages):
      event_list = event_list_request(page=page)
      self.process_event_list(ingestion_run=ingestion_run, event_list=event_list, debug=debug)