"""Crawler for the Showboat

As of 2023-11-14
Entry point: https://www.showboatseattle.com/shows

We can use data from a json dump that populates the data. Near the bottom of the
page there is a <script type="application/json" id="wix-warmup-data">{}</script>
that contains a json dump of data used to populate the page.
"""
import json
import logging

from api.constants import IngestionApis
from api.models import Venue
from api.utils import crawler_utils, event_utils, parsing_utils

logger = logging.getLogger(__name__)

SHOWBOAT_SHOWS_URL = "https://www.showboatseattle.com/shows"

def get_events(data: dict) -> list[dict]:
  """Get events from wix-warmup-data dict."""
  for _, val in data["appsWarmupData"].items():
    for sub_key, sub_val in val.items():
      if "widgetcomp" not in sub_key:
        continue

      return sub_val["events"]["events"]


def crawl(venue: Venue, debug: bool=False):
  """Crawl data for showboat!"""
  driver = crawler_utils.create_chrome_driver()
  soup = crawler_utils.get_html_soup(driver, SHOWBOAT_SHOWS_URL)
  warmup_element = soup.find(id="wix-warmup-data")
  data = json.loads(warmup_element.text)
  events = get_events(data)
  for event in events:
    if "open mic" in event["title"].lower():
      continue

    event_url = f"{SHOWBOAT_SHOWS_URL}/{event['slug']}"
    if "external" in event["registration"]:
      event_url = event["registration"]["external"]["registration"]

    event_day = event["scheduling"]["config"]["startDate"].split("T")[0]
    start_time = parsing_utils.parse_12hr_time(event["scheduling"]["startTimeFormatted"])
    _ = event_utils.create_or_update_event(
      venue=venue,
      title=event["title"],
      event_day=event_day,
      start_time=start_time,
      event_api=IngestionApis.CRAWLER,
      event_url=event_url,
      event_image_url=event["mainImage"]["url"]
    )
