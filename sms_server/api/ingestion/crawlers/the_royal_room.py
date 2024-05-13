"""Crawler for the royal room!

Main events listing page is here: https://theroyalroomseattle.com/events/

But they have an "api" that can be posted to here:
https://theroyalroomseattle.com/em-ajax/get_listings/

"api" in quotes because it returns the html for the event listing page, but
still means there's less garbage to parse AND we can specify a total number of
events we want to grab this way.
"""
import logging
import re
import requests
from datetime import datetime

import cssutils
from bs4 import BeautifulSoup

from api.ingestion.crawlers.crawler import Crawler
from api.models import IngestionRun, Venue
from api.utils import event_utils, parsing_utils

logger = logging.getLogger(__name__)

CALENDAR_API_URL = "https://theroyalroomseattle.com/em-ajax/get_listings/"
FORM_DATA = {
  "per_page": 30, 
  "orderby": "event_start_date",
  "order": "ASC",
  "page": 1,
  "show_pagination": False
}

class TheRoyalRoomCrawler(Crawler):

  def __init__(self) -> object:
    super().__init__(crawler_name="the_royal_room", venue_name_regex="^the royal room$")

  def get_event_kwargs(self, event_data: dict) -> dict:
    return event_data
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    """Crawl data!!!"""
    headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    raw_request = requests.post(CALENDAR_API_URL, headers=headers, data=FORM_DATA)
    soup = BeautifulSoup(raw_request.json()["html"], "html.parser")

    for event_div in soup.find_all("div", class_="event_listing"):
      anchor_link = event_div.find("a", class_="wpem-event-action-url")
      banner_image_div = event_div.find("div", class_="wpem-event-banner-img")
      style = cssutils.parseStyle(banner_image_div["style"])
      # Need to strip the url(...) part of the background-image declaration.
      event_image_url = style["background-image"][4:-1]
      event_title_heading = event_div.find("h3", class_="wpem-heading-text")

      date_time_span = event_div.find("span", class_="wpem-event-date-time-text")
      
      chunks = re.split(r"\s\s+", date_time_span.text.strip())
      # Parse the event day which looks like Monday, January 3, 2024.
      event_day = datetime.strptime(chunks[0], "%A, %B %d, %Y")
      # Parse the start time, this can optionally include an end time, but we
      # ignore that for now.
      # @ 07:30 PM 
      start_time = parsing_utils.parse_12hr_time(chunks[1].split("-")[0].strip()[2:])

      event_data = {
        "title": event_title_heading.text,
        "event_image_url": event_image_url,
        "event_url": anchor_link["href"],
        "event_day": event_day,
        "start_time": start_time,
      }

      self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
