"""Ingest data from AXS.

AXS has much better protections in place than the rest of the apis I've been
"integrating" with. We avoid the restrictions by querying their search page
to get a valid CSRF Token, and then using that in subsequent requests to their
API.
"""
import logging
import math
import time

import json
from selenium import webdriver

from api.constants import IngestionApis
from api.models import APISample
from api.utils import crawler_utils, event_utils, parsing_utils, venue_utils

logger = logging.getLogger(__name__)

PER_PAGE = 15

def get_csrf_token(driver: webdriver.Chrome):
  """Get a valid CSRF Token from AXS."""
  # We first query the search page to get a valid CSRF token, then reuse that
  # token to make a validated request to the API. In order to bypass the
  # protections AXS has in place, we use selenium and a "normal" user agent.
  soup = crawler_utils.get_html_soup(driver, "https://www.axs.com/browse/music?q=seattle")
  # We then look for the "hdn_csrf_token" input -- something like this:
  # <input id="hdn_csrf_token" type="hidden" value="Wrt06Y2wRCus0d7_YxlmLuQsg90KS45zwhozujtNjnY"/>
  csrf_token_input = soup.find(id="hdn_csrf_token")
  return csrf_token_input.get("value")

def event_list_request(driver: webdriver.Chrome, csrf_token: str, page: int=1) -> dict:
  """Get a list of events from AXS."""
  soup = crawler_utils.get_html_soup(
    driver,
    f"https://www.axs.com/apip/event/category?siteId=999&csrf_token={csrf_token}&majorCat=2&lat=47.63480&long=-122.34510&radius=50&locale=en-US&rows={PER_PAGE}&page={page}"
  )
  return json.loads(soup.body.string)

def get_biggest_non_default_image(media: dict) -> str:
  """Returns the biggest non default image from a media dict from axs resp."""
  if not media:
    return ""

  max_key = None
  max_width = 0
  for key, info in media.items():
    if "default" in info["file_name"]:
      continue

    if info["width"] > max_width:
      max_key = key
      max_width = info["width"]

  if not max_key:
    return ""

  return media[max_key]["file_name"]


def process_event_list(event_list: list[dict], debug: bool=False) -> None:
  """Process a list of AXS events."""
  for event in event_list:
    venue_data = event["venue"]
    venue = venue_utils.create_or_update_venue(
      name=venue_data["title"],
      latitude=venue_data["latitude"],
      longitude=venue_data["longitude"],
      address=venue_data["address"],
      postal_code=venue_data["postalCode"],
      city=venue_data["city"],
      venue_image_url=get_biggest_non_default_image(venue_data["media"]),
      api_name=IngestionApis.AXS,
      api_id=venue_data["venueId"],
      debug=debug
    )

    if event["eventDateTime"] == "TBD":
      continue

    event_day, start_time = event["eventDateTime"].split("T")
    event_utils.create_or_update_event(
      venue=venue,
      title=event["title"]["eventTitleText"],
      event_day=event_day,
      start_time=start_time,
      ticket_price_max=parsing_utils.parse_cost(event["ticketPriceHigh"]),
      ticket_price_min=parsing_utils.parse_cost(event["ticketPriceLow"]),
      event_api="AXS",
      event_url=event["ticketing"]["url"],
      event_image_url=get_biggest_non_default_image(event["media"]),
      description=event["description"],
    )

def import_data(delay: float=0.5, debug=False):
  """Import data from AXS."""
  logger.info("IMPORT FROM AXS")
  driver = crawler_utils.create_chrome_driver()
  csrf_token = get_csrf_token(driver)
  data = event_list_request(driver, csrf_token, page=1)
  # Save the response from the first page.
  APISample.objects.create(
    name="All data page 1",
    api_name=IngestionApis.AXS,
    data=data
  )
  process_event_list(data["events"], debug=debug)
  # AXS returns total events, not total pages. Little bit of maths.
  last_page = math.ceil(data["meta"]["total"] / PER_PAGE) + 1
  for page in range(2, last_page):
    data = event_list_request(driver, csrf_token, page=page)
    process_event_list(data["events"], debug=debug)
    # Insert artifical delay to avoid hitting any QPS limits.
    time.sleep(delay)
