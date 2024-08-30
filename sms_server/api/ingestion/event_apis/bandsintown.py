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
from sms_server.settings import BANDSINTOWN_APP_ID

logger = logging.getLogger(__name__)

class BandsintownApi(EventApi):

  has_artists = True

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.BANDSINTOWN)

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    venue_data = raw_data["jsonLdContainer"]["eventJsonLd"]["location"]
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
    event_info = raw_data["jsonLdContainer"]["eventJsonLd"]
    event_day, start_time = event_info["startDate"].split("T")
    # Need to remove the -07:00 from the start time.
    start_time = start_time[:8]
    return {
      "title": event_info["name"],
      "event_day": event_day,
      "start_time": start_time,
      "event_url": event_info["url"],
      "event_image_url": event_info["image"],
      "description": event_info["description"]
    }
  
  def get_artist_detail(self, artist_name: str) -> dict:
    """Get detailed info for an artist."""
    try:
      r = requests.get(f"https://rest.bandsintown.com/artists/{artist_name}?app_id={BANDSINTOWN_APP_ID}", headers={"Content-Type": "application/json"}, timeout=10)
      return r.json()
    except Exception as e:
      return {}
    
  def load_artist_info(self, all_data: dict) -> list[dict]:
    artists = []
    for performer in all_data["eventView"]["body"]["eventInfoContainer"]["lineupContainer"]["lineupItems"]:
      time.sleep(2)
      detail = self.get_artist_detail(performer["name"])
      artists.append(detail if detail else performer)

    return artists
  
  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    for artist in raw_data["artist_info"]:
      links = [
        {
          "platform": link["type"],
          "url": link.get("url", "") or link.get("link", "")
        } for link in artist.get("links", [])
      ]

      yield {
        "name": artist["name"],
        "bio": artist.get("description", ""),
        "artist_image_url": artist.get("image_url", ""),
        "social_links": links
      }

  def get_raw_data_info(self, raw_data: dict) -> dict:
    event_info = raw_data["jsonLdContainer"]["eventJsonLd"]
    return {
      "event_api_id": event_info["url"].split("?")[0],
      "event_name": event_info["name"],
      "venue_name": event_info["location"]["name"],
      "event_day": event_info["startDate"].split("T")[0]
    }
  
  def get_paginated_url(self, page_number: int=1) -> str:
    return f"https://www.bandsintown.com/all-dates/fetch-next/upcomingEvents?page={page_number}&longitude=-122.3701&latitude=47.6674"
  
  def get_event_detail(self, event_url: str) -> dict:
    r = requests.get(event_url, headers={"User-Agent": crawler_utils.USER_AGENT})
    start = "<script>window.__data="
    end = "</script>"
    # Interestingly, the window data for the page contains a LOT more
    # information in it than the event info.
    for line in r.text.split("\n"):
      line = line.strip()
      if not line.startswith(start):
        continue

      all_data = json.loads(line[len(start):-len(end)])
      # Return a subset so it's actually readable. We also want to fetch related
      # info about artists in the ingestion phase so we aren't pulling data
      # in the creation phase.
      return {
        "jsonLdContainer": all_data["jsonLdContainer"],
        "lineup": all_data["eventView"]["body"]["eventInfoContainer"]["lineupContainer"]["lineupItems"],
        "artist_info": self.load_artist_info(all_data)
      }
    
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
      time.sleep(2)

    time.sleep(60)
    for i, event_url in enumerate(all_event_urls):
      time.sleep(3)
      try:
        event_data = self.get_event_detail(event_url)
        yield event_data
      except:
        yield {"failed_on_url": event_url}
