"""Ingest data from AXS.

AXS has much better protections in place than the rest of the apis I've been
"integrating" with. We avoid the restrictions by querying their search page
to get a valid CSRF Token, and then using that in subsequent requests to their
API.
"""
import math
import time
from pprint import pprint

import json
from bs4 import BeautifulSoup
from selenium import webdriver
import undetected_chromedriver

from api.utils import event_utils, parsing_utils, venue_utils

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
PER_PAGE = 15

def create_chrome_driver():
  """Create a headless chrome driver for requests."""
  options = undetected_chromedriver.ChromeOptions()
  options.add_argument("--headless")
  # options.add_argument("--enable-javascript")
  options.add_argument(f"--user-agent={USER_AGENT}")
  return undetected_chromedriver.Chrome(options=options)

def get_csrf_token(driver: webdriver.Chrome):
  """Get a valid CSRF Token from AXS."""
  # We first query the search page to get a valid CSRF token, then reuse that
  # token to make a validated request to the API. In order to bypass the
  # protections AXS has in place, we use selenium and a "normal" user agent.
  driver.get("https://www.axs.com/browse/music?q=seattle")
  soup = BeautifulSoup(driver.page_source, "html.parser")
  # We then look for the "hdn_csrf_token" input -- something like this:
  # <input id="hdn_csrf_token" type="hidden" value="Wrt06Y2wRCus0d7_YxlmLuQsg90KS45zwhozujtNjnY"/>
  csrf_token_input = soup.find(id="hdn_csrf_token")
  return csrf_token_input.get("value")

def event_list_request(driver: webdriver.Chrome, csrf_token: str, page: int=1):
  """Get a list of events from AXS."""
  driver.get(f"https://www.axs.com/apip/event/category?siteId=999&csrf_token={csrf_token}&majorCat=2&lat=47.63480&long=-122.34510&radius=50&locale=en-US&rows={PER_PAGE}&page={page}")
  soup = BeautifulSoup(driver.page_source, "html.parser")
  return json.loads(soup.body.string)

def process_event_list(event_list: list[dict], debug: bool=False) -> None:
  """Process a list of AXS events."""
  for event in event_list:
    pprint(event)
    venue_data = event["venue"]
    venue = venue_utils.get_or_create_venue(
      name=venue_data["title"],
      latitude=venue_data["latitude"],
      longitude=venue_data["longitude"],
      address=venue_data["address"],
      postal_code=venue_data["postalCode"],
      city=venue_data["city"],
      api_name="AXS",
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
      event_url=event["ticketing"]["url"]
    )

def import_data(delay: float=0.5, debug=False):
  """Import data from AXS."""
  driver = create_chrome_driver()
  csrf_token = get_csrf_token(driver)
  data = event_list_request(driver, csrf_token, page=1)
  process_event_list(data["events"], debug=debug)
  # AXS returns total events, not total pages. Little bit of maths.
  last_page = math.ceil(data["meta"]["total"] / PER_PAGE) + 1
  for page in range(2, last_page):
    data = event_list_request(driver, csrf_token, page=page)
    process_event_list(data["events"], debug=debug)
    # Insert artifical delay to avoid hitting any QPS limits.
    time.sleep(delay)
