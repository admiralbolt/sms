"""Ingest data from Venupilot.

Venuepilot doesn't have any sort of search scope features, so we query all
events and then filter by city accordingly.
"""
from datetime import datetime
from typing import Optional

import requests

from api.constants import IngestionApis
from api.models import APISample, Event, Venue
from api.utils import event_utils, venue_utils

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
  return requests.post("https://www.venuepilot.co/graphql", headers=headers, json=data, timeout=15).json()

def get_or_create_venue(venue_data: dict, debug: bool=False) -> Venue:
  """Get or create a venue!"""
  address = venue_data["street1"]
  if venue_data["street2"]:
    address += f" {venue_data['street2']}"

  return venue_utils.get_or_create_venue(
    name=venue_data["name"],
    latitude=venue_data["lat"],
    longitude=venue_data["long"],
    address=address,
    postal_code=venue_data["postal"],
    city=venue_data["city"],
    api_name="Venuepilot",
    api_id=venue_data["id"],
    debug=debug,
  )

def get_or_create_event(venue: Venue, event: dict) -> Event:
  """Get or create an event!"""
  event_utils.create_or_update_event(
    venue=venue,
    title=event["name"],
    event_day=event["date"],
    start_time=event["startTime"],
    ticket_price_min=event["priceMin"] or 0,
    ticket_price_max=event["priceMax"] or 0,
    event_api=IngestionApis.VENUEPILOT,
    event_url=event["ticketsUrl"]
  )

def process_event_list(event_list, debug: bool=False) -> None:
  """Process a list of events from venuepilot."""
  for event in event_list["data"]["paginatedEvents"]["collection"]:
    if event["venue"]["city"].lower() != "seattle":
      continue

    venue = get_or_create_venue(event["venue"], debug=debug)
    get_or_create_event(venue, event)


def import_data(debug=False):
  """Import all data from venuepilot."""
  data = event_list_request(page=0)
  # Save the response from the first page.
  APISample.objects.create(
    name="All data page 1",
    api_name=IngestionApis.VENUEPILOT,
    data=data
  )
  total_pages = data["data"]["paginatedEvents"]["metadata"]["totalPages"]
  process_event_list(data, debug=debug)
  for page in range(1, total_pages):
    data = event_list_request(page=page)
    process_event_list(data, debug=debug)
