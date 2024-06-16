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
from api.ingestion.ingester import Ingester
from api.models import IngestionRun
from api.utils import crawler_utils, parsing_utils

logger = logging.getLogger(__name__)

PER_PAGE = 15

def get_csrf_token(driver: webdriver.Chrome):
  """Get a valid CSRF Token from AXS."""
  # We first query the search page to get a valid CSRF token, then reuse that
  # token to make a validated request to the API. In order to bypass the
  # protections AXS has in place, we use selenium and a "normal" user agent.
  soup = crawler_utils.get_html_soup(driver, "https://www.axs.com/")
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

class AXSIngester(Ingester):

  delay: float = 0.5

  def __init__(self):
    super().__init__(api_name=IngestionApis.AXS)

  def get_event_detail(self, event_id: str) -> dict:
    return {}

  def get_venue_kwargs(self, event_data: dict) -> dict:
    venue_data = event_data["venue"]
    return {
      "name": venue_data["title"],
      "latitude": venue_data["latitude"],
      "longitude": venue_data["longitude"],
      "address": venue_data["address"],
      "postal_code": venue_data["postalCode"],
      "city": venue_data["city"],
      "venue_image_url": get_biggest_non_default_image(venue_data["media"]),
      "api_id": venue_data["venueId"],
    }
  
  def get_event_kwargs(self, event_data: dict) -> dict:
    event_day, start_time = None, None
    if event_data["eventDateTime"] != "TBD":
      event_day, start_time = event_data["eventDateTime"].split("T")

    return {
      "title": event_data["title"]["eventTitleText"],
      "event_day": event_day,
      "start_time": start_time,
      "event_url": event_data["ticketing"]["url"],
      "event_image_url": get_biggest_non_default_image(event_data["media"]),
      "description": event_data["description"],
    }
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool=False) -> None:
    driver = crawler_utils.create_chrome_driver()
    csrf_token = get_csrf_token(driver)
    data = event_list_request(driver, csrf_token, page=1)
    for event_data in data["events"]:
      self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
    # AXS returns total events, not total pages. Little bit of maths.
    last_page = math.ceil(data["meta"]["total"] / PER_PAGE) + 1
    for page in range(2, last_page):
      # Insert artifical delay to avoid hitting any QPS limits.
      time.sleep(self.delay)
      data = event_list_request(driver, csrf_token, page=page)
      for event_data in data["events"]:
        self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)