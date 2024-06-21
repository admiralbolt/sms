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
from typing import Generator

from bs4 import BeautifulSoup

from api.constants import IngestionApis
from api.ingestion.crawlers.crawler import AbstractCrawler
from api.utils import parsing_utils

logger = logging.getLogger(__name__)

SEAMONSTER_URL = "https://www.seamonsterlounge.com/buy-tickets-in-advance"

class SeaMonsterLoungeCrawler(AbstractCrawler):

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.CRAWLER_SEA_MONSTER_LOUNGE, venue_name_regex="^sea monster lounge$")

  def get_event_kwargs(self, raw_data: dict) -> dict:
    return {
      "event_url": f"https://www.seamonsterlounge.com/event-info/{raw_data['slug']}",
      "event_image_url": raw_data.get("mainImage", {}).get("url", ""),
      "event_day": raw_data["event_day"],
      "start_time": parsing_utils.parse_12hr_time(raw_data["scheduling"]["startTimeFormatted"]),
      "title": raw_data["title"].strip(),
    }
  
  def get_event_list(self) -> Generator[dict, None, None]:
    headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    sea_monster_request = requests.get(SEAMONSTER_URL, headers=headers, timeout=15)
    soup = BeautifulSoup(sea_monster_request.text, "html.parser")
    script_tag = soup.find("script", type="application/json", id="wix-warmup-data")
    data = json.loads(script_tag.string)
    for _, val in data["appsWarmupData"].items():
      for _, val2 in val.items():
        for event_data in val2["events"]["events"]:
          event_data["event_day"] = datetime.strptime(event_data["scheduling"]["startDateFormatted"], "%B %d, %Y").strftime("%Y-%m-%d")
          event_data["event_api_id"] = event_data["slug"]
          event_data["event_name"] = event_data["title"].strip()
          yield event_data
          # Explicit handling for monday night jams aka la luz. We want to
          # handle those via the open mic generator instead of importing.
          # if "la luz" in event_data["title"].lower():
          #   IngestionRecord.objects.create(
          #     ingestion_run=ingestion_run,
          #     api_name=f"Crawler - {self.titleized_name}",
          #     change_type=ChangeTypes.SKIP,
          #     change_log=f"Skipping La Luz event, handled by open mic gen.",
          #     field_changed="event",
          #   )
          #   continue
      