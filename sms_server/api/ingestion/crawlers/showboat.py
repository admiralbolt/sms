"""Crawler for the Showboat

As of 2023-11-14
Entry point: https://www.showboatseattle.com/shows

We can use data from a json dump that populates the data. Near the bottom of the
page there is a <script type="application/json" id="wix-warmup-data">{}</script>
that contains a json dump of data used to populate the page.
"""
import json
import logging
import requests

from bs4 import BeautifulSoup

from api.constants import IngestionApis
from api.models import Venue
from api.utils import event_utils, parsing_utils

logger = logging.getLogger(__name__)

SHOWBOAT_SHOWS_URL = "https://www.showboatseattle.com/shows"

def get_events(data: dict) -> list[dict]:
  for _, val in data["appsWarmupData"].items():
    for sub_key, sub_val in val.items():
      if "widgetcomp" not in sub_key:
        continue

      return sub_val["events"]["events"]


def crawl(venue: Venue, debug: bool=False):
  """Crawl data for showboat!"""
  headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  }
  raw_request = requests.get(SHOWBOAT_SHOWS_URL, headers=headers, timeout=15)
  soup = BeautifulSoup(raw_request.text, "html.parser")
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
    )