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
from typing import Optional

import json
import requests

from api.constants import IngestionApis
from api.models import APISample, Venue
from api.utils import event_utils, venue_utils
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

def get_full_event_description(event_id: str) -> str:
  """Loads full HTML body of the event description."""
  headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {settings.EVENTBRITE_TOKEN}"
  }
  response = requests.get(f"https://www.eventbriteapi.com/v3/events/{event_id}/structured_content/?purpose=listing", headers=headers, timeout=10).json()
  for module in response["modules"]:
    if module["type"] != "text":
      continue

    return module.get("data", {}).get("body", {}).get("text", None)

  return None

def event_detail_request(event_id: str):
  """Get detailed info about an event.

  All information about an event isn't included unless you specify specific
  expansions. See the "Using Expansions to Get Information on an Event" section
  of the Eventbrite docs. We add a list of comma separated keywords to get the
  full set of information for an event.
  """
  headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {settings.EVENTBRITE_TOKEN}"
  }
  return requests.get(f"https://www.eventbriteapi.com/v3/events/{event_id}/?expand=ticket_classes", headers=headers, timeout=35).json()

def get_or_create_venue(venue_data: dict, debug: bool=False) -> Optional[Venue]:
  """Get or create a venue."""
  # Found some "venues" that are just a city. Skip these.
  if "postal_code" not in venue_data["address"]:
    return None

  address = venue_data["address"]["address_1"]
  if venue_data["address"]["address_2"]:
    address += f" {venue_data['address']['address_2']}"

  return venue_utils.create_or_update_venue(
    name=venue_data["name"],
    latitude=venue_data["address"]["latitude"],
    longitude=venue_data["address"]["longitude"],
    address=address,
    postal_code=venue_data["address"]["postal_code"],
    city=venue_data["address"]["city"],
    api_name=IngestionApis.EVENTBRITE,
    api_id=venue_data["id"],
    debug=debug,
  )

def get_or_create_event(venue: Venue, event_detail):
  """Get or create an event."""
  event_start = event_detail["start"]["local"]
  event_day, start_time = event_start.split("T")

  # Eventbrite returns a list of ticket classes -- General Advance, Student
  # Advance, Box Office e.t.c. We aggregate data across the ticket classes to
  # get an idea of the cost. The cost value field is in cents, so we need to
  # divide by 100 after the fact.
  #
  # ALSO
  # Occasionally costs is `None` if it's a free / donation event.
  min_cost = 0
  max_cost = 0
  costs = []
  for ticket_class in event_detail["ticket_classes"]:
    if not ticket_class["cost"]:
      break
    costs.append(ticket_class["cost"]["value"] / 100)

  if costs:
    min_cost = min(costs)
    max_cost = max(costs)

  event_image_url = ""
  logo = event_detail.get("logo", {})
  if logo:
    event_image_url = logo.get("url", "")


  event_utils.create_or_update_event(
    venue=venue,
    title=event_detail["name"]["text"],
    event_day=event_day,
    start_time=start_time,
    ticket_price_min=min_cost,
    ticket_price_max=max_cost,
    event_api=IngestionApis.EVENTBRITE,
    event_url=event_detail["url"],
    event_image_url=event_image_url,
    description=get_full_event_description(event_detail["id"]) or event_detail.get("summary", "")
  )

def process_event_list(event_list: list[dict], delay: float=0.5, debug: bool=False):
  """Process the list of events returned from the Eventbrite search UI."""
  for event_data in event_list:
    event_detail = event_detail_request(event_id=event_data["id"])
    venue = get_or_create_venue(event_data["primary_venue"], debug=debug)
    if not venue:
      continue

    if not event_detail:
      print(event_data)
      continue

    get_or_create_event(venue, event_detail)
    # Insert artifical delay to avoid hitting QPS limits.
    time.sleep(delay)


def import_data(delay: float=0.5, debug=False):
  """Import data from Eventbrite."""
  data = event_list_request(page=1)
  # Save the response from the first page.
  APISample.objects.create(
    name="All data page 1",
    api_name=IngestionApis.EVENTBRITE,
    data=data
  )
  process_event_list(data["search_data"]["events"]["results"], delay=delay, debug=debug)
  for page in range(2, data["page_count"]):
    data = event_list_request(page=page)
    process_event_list(data["search_data"]["events"]["results"], delay=delay, debug=debug)
    