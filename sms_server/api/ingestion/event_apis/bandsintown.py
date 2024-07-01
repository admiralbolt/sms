"""BandsInTown Notes!!!

Upcoming events can be found here:
https://www.bandsintown.com/all-dates/fetch-next/upcomingEvents?page=2&longitude=-122.3701&latitude=47.6674

Can get the event url from this response => under the key "eventUrl", e.g.:

https://www.bandsintown.com/e/1032001879-black-nite-crash-at-the-vera-project?came_from=257&utm_medium=web&utm_source=home&utm_campaign=event

The event landing page has all the information about the event dumped into json
(which seems to be a pretty common practice).

There's a <script type="application/ld+json">{...}</script> at the bottom that
contains "@type": "MusicEvent", with all the relevant, easily parsable details
in it!
"""
import json
import logging
import requests
import time
from typing import Generator

import bs4

from api.constants import IngestionApis
from api.ingestion.event_apis.event_api import EventApi
from api.utils import crawler_utils

logger = logging.getLogger(__name__)

class BandsintownApi(EventApi):

  has_artists = True

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.BANDSINTOWN)
    self.driver = crawler_utils.create_chrome_driver()

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    venue_data = raw_data["location"]
    address_data = venue_data["address"]
    return {
      "name": venue_data["name"],
      "latitude": venue_data["geo"]["latitude"],
      "longitude": venue_data["geo"]["longitude"],
      "address": address_data["streetAddress"],
      "city": address_data["addressLocality"],
      "postal_code": address_data["postalCode"],
    }

  def get_event_kwargs(self, raw_data: dict) -> dict:
    event_day, start_time = raw_data["startDate"].split("T")
    # Need to remove the -07:00 from the start time.
    start_time = start_time[:8]
    return {
      "title": raw_data["name"],
      "event_day": event_day,
      "start_time": start_time,
      "event_url": raw_data["url"],
      "event_image_url": raw_data["image"],
      "description": raw_data["description"]
    }
  
  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    for performer in raw_data["performer"]:
      yield {"name": performer["name"], "bio": performer.get("description", "")}

  def get_raw_data_info(self, raw_data: dict) -> dict:
    return {
      "event_api_id": raw_data["url"].split("?")[0],
      "event_name": raw_data["name"],
      "venue_name": raw_data["location"]["name"],
      "event_day": raw_data["startDate"].split("T")[0]
    }
  
  def get_paginated_url(self, page_number: int=1) -> str:
    return f"https://www.bandsintown.com/all-dates/fetch-next/upcomingEvents?page={page_number}&longitude=-122.3701&latitude=47.6674"
  
  def get_event_detail(self, event_url: str) -> dict:
    r = requests.get(event_url, headers={"User-Agent": crawler_utils.USER_AGENT})
    soup = bs4.BeautifulSoup(r.text, "html.parser")
    script_tags = soup.find_all("script", type="application/ld+json")
    for script_tag in script_tags:
      data = json.loads(script_tag.string)
      if data and data["@type"] == "MusicEvent":
        return data
    
    logger.error("no data found for url: %s, raw_html: %s", event_url, r.text)
    return None

  def get_event_list(self) -> Generator[dict, None, None]:
    page_number = 1
    all_event_urls = set()
    while True:
      page = requests.get(self.get_paginated_url(page_number), headers={"User-Agent": crawler_utils.USER_AGENT}, timeout=10).json()

      prev_size = len(all_event_urls)
      for event in page["events"]:
        all_event_urls.add(event["eventUrl"].split("?")[0])
      if len(all_event_urls) == prev_size:
        break

      page_number += 1
      time.sleep(1.5)

    logger.info("API=Bandsintown, Total Events: %s", len(all_event_urls))
    for i, event_url in enumerate(all_event_urls):
      logger.info("API=Bandsintown, processing event (%s, %s)", i, event_url)
      time.sleep(1.5)
      event_data = self.get_event_detail(event_url)
      if event_data and "url" in event_data:
        yield event_data
