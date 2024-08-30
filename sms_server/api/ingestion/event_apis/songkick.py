"""Songkick API.

Seattle events page landing is here:

https://www.songkick.com/metro-areas/2846-us-seattle

Each event has some associated json data in it:

<div class="microformat">
  <script type="application/ld+json">...</script>
</div>

Which seems to contain all the info we need, including the names of the performers, which is quite swell.


We can get paginated data with urls that look like this:

https://www.songkick.com/metro-areas/2846-us-seattle?page=2#metro-area-calendar

Total number of pages can be found in a pagination element that looks like:
<div role="navigation" aria-label="Pagination" class="pagination">
"""

import json
from typing import Generator

import bs4

from api.constants import IngestionApis
from api.ingestion.event_apis.event_api import EventApi
from api.utils import crawler_utils


class SongkickApi(EventApi):
  has_artists = True

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.SONGKICK)

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
      "event_image_url": f"https://images.sk-static.com/images/{raw_data['image']}" if raw_data["image"] else "",
      "description": raw_data["description"],
    }

  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    for performer in raw_data["performer"]:
      yield {"name": performer["name"]}

  def get_raw_data_info(self, raw_data: dict) -> dict:
    return {
      "event_api_id": raw_data["url"].split("?")[0],
      "event_name": raw_data["name"],
      "venue_name": raw_data["location"]["name"],
      "event_day": raw_data["startDate"].split("T")[0],
    }

  def get_paginated_url(self, page_number: int = 1) -> str:
    return f"https://www.songkick.com/metro-areas/2846-us-seattle?page={page_number}#metro-area-calendar"

  def process_page(self, soup: bs4.BeautifulSoup) -> Generator[dict, None, None]:
    for micro_div in soup.find_all("div", class_="microformat"):
      script_tag = micro_div.find("script", type="application/ld+json")
      data = json.loads(script_tag.string)
      event = data[0]
      if event["@type"] != "Event":
        continue

      yield event

  def get_event_list(self) -> Generator[dict, None, None]:
    first_page = crawler_utils.get_html_soup(url=self.get_paginated_url(page_number=1))
    # Get the total number of pages.
    pagination_div = first_page.find_all("div", class_="pagination")[0]
    anchors = pagination_div.find_all("a")
    # The last anchor is the "next" button, the second to last is the max page.
    max_page = int(anchors[-2].text)
    for event in self.process_page(first_page):
      yield event

    for page_number in range(2, max_page + 1):
      page = crawler_utils.get_html_soup(url=self.get_paginated_url(page_number=page_number))
      for event in self.process_page(page):
        yield event
