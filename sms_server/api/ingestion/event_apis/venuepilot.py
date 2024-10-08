"""Ingest data from Venupilot.

Venuepilot doesn't have any sort of search scope features, so we query all
events and then filter by city accordingly.
"""

import logging
from datetime import datetime
from typing import Generator, Optional

import requests

from api.constants import IngestionApis
from api.ingestion.event_apis.event_api import EventApi

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

logger = logging.getLogger(__name__)


def event_list_request(min_start_date: Optional[str] = None, page: int = 0):
  """Get a list of events from Venuepilot."""
  min_start_date = min_start_date or datetime.today().strftime("%Y-%m-%d")
  headers = {"Content-Type": "application/json"}
  data = {"operationName": "PaginatedEvents", "query": REQUEST_TEMPLATE % (page, min_start_date)}
  return requests.post("https://www.venuepilot.co/graphql", headers=headers, json=data, timeout=30).json()


class VenuepilotApi(EventApi):
  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.VENUEPILOT)

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    venue_data = raw_data["venue"]
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

  def get_event_kwargs(self, raw_data: dict) -> dict:
    return {
      "title": raw_data["name"],
      "event_day": raw_data["date"],
      "start_time": raw_data["startTime"],
      "event_url": raw_data["ticketsUrl"],
      "description": raw_data["description"],
      "event_image_url": raw_data["highlightedImage"],
    }

  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    # Technically venuepilot has artist info, but in practice I've never seen
    # the 'artist' field actually populated.
    if "artist" in raw_data:
      logger.info("WE HAVE ARTIST!!!")
      logger.info(raw_data["artist"])

    yield {}

  def get_raw_data_info(self, raw_data: dict) -> dict:
    return {
      "event_api_id": raw_data["id"],
      "event_name": raw_data["name"],
      "venue_name": raw_data["venue"]["name"],
      "event_day": raw_data["date"],
    }

  def process_event_list(self, event_list: list[dict]) -> Generator[dict, None, None]:
    for event_data in event_list["data"]["paginatedEvents"]["collection"]:
      if event_data["venue"]["city"].lower() != "seattle":
        continue
      yield event_data

  def get_event_list(self) -> Generator[dict, None, None]:
    event_list = event_list_request(page=0)
    total_pages = event_list["data"]["paginatedEvents"]["metadata"]["totalPages"]
    for event in self.process_event_list(event_list):
      yield event
    for page in range(1, total_pages):
      event_list = event_list_request(page=page)
      for event in self.process_event_list(event_list):
        yield event
