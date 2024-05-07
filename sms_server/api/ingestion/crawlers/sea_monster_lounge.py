"""Crawler for Sea Monster Lounge
As of 2024-05-06, entry point is: https://www.seamonsterlounge.com/

Wix site that's using some kind of calendar plugin, and thankfully all the data
is dumped in a json object on the page. 

<!-- warmup data start -->
<script type="application/json" id="wix-warmup-data">{...}</script>
<!-- warmup data end -->
"""
import json
import logging
import requests
from datetime import datetime

from bs4 import BeautifulSoup

from api.constants import ChangeTypes
from api.ingestion.crawlers.crawler import Crawler
from api.models import IngestionRecord, IngestionRun
from api.utils import parsing_utils

from pprint import pprint

logger = logging.getLogger(__name__)

SEAMONSTER_URL = "https://www.seamonsterlounge.com/buy-tickets-in-advance"

class SeaMonsterLoungeCrawler(Crawler):

  def __init__(self) -> object:
    super().__init__(crawler_name="sea_monster_lounge", venue_name_regex="^sea monster lounge$")

  def get_event_kwargs(self, event_data: dict) -> dict:
    return {
      "event_url": f"https://www.seamonsterlounge.com/event-info/{event_data['slug']}",
      "event_image_url": event_data.get("mainImage", {}).get("url", ""),
      "event_day": datetime.strptime(event_data["scheduling"]["startDateFormatted"], "%B %d, %Y"),
      "start_time": parsing_utils.parse_12hr_time(event_data["scheduling"]["startTimeFormatted"]),
      "title": event_data["title"].strip(),
    }
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool=False) -> None:
    """Crawl data for the sea monster lounge."""
    headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    sea_monster_request = requests.get(SEAMONSTER_URL, headers=headers, timeout=15)
    soup = BeautifulSoup(sea_monster_request.text, "html.parser")

    # Find our script tag.
    script_tag = soup.find("script", type="application/json", id="wix-warmup-data")
    data = json.loads(script_tag.string)
    for _, val in data["appsWarmupData"].items():
      for _, val2 in val.items():
        for event_data in val2["events"]["events"]:
          # Explicit handling for monday night jams aka la luz. We want to
          # handle those via the open mic generator instead of importing.
          if "la luz" in event_data["title"].lower():
            IngestionRecord.objects.create(
              ingestion_run=ingestion_run,
              api_name=f"Crawler - {self.titleized_name}",
              change_type=ChangeTypes.SKIP,
              change_log=f"Skipping La Luz event, handled by open mic gen.",
              field_changed="event",
            )
            continue
          self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
      