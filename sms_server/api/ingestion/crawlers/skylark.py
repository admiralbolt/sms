"""Crawler for skylark.

As of 2023-11-04,
Entry point: https://www.skylarkcafe.com/calendar
Upcoming shows are contained within divs emulating list items.
Very sparse information about the shows themselves, but it's a start.
"""
import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

from api.ingestion.crawlers.crawler import Crawler
from api.models import IngestionRun, Venue

SKYLARK_ROOT = "https://www.skylarkcafe.com"

class SkylarkCrawler(Crawler):

  def __init__(self) -> object:
    super().__init__(crawler_name="skylark", venue_name_regex="^skylark$")

  def get_event_kwargs(self, event_data: dict) -> dict:
    return event_data
  
  def import_data(self, ingestion_run: IngestionRun, venue: Venue, debug: bool = False) -> None:
    skylark_request = requests.get(f"{SKYLARK_ROOT}/calendar", timeout=15)
    soup = BeautifulSoup(skylark_request.text, "html.parser")
    all_events = soup.find_all("div", class_="w-dyn-items")
    # Old events are hidden on the page.
    for child in all_events[0].findChildren("div", recursive=False):
      event_titles = child.find_all("div", class_="text-block-12")

      learn_more = child.find_all("a", class_="link-block-4")
      event_url = f"{SKYLARK_ROOT}/{learn_more[0]['href']}"

      event_dates = child.find_all("div", class_="date")
      start_date = datetime.strptime(event_dates[0].text, "%B %d, %Y %I:%M %p")

      image_div = child.find_all("div", class_="artist-image")[0]
      # Quick n' dirty. This WILL break.
      urls = re.findall(r'url\([\'"](.*?)[\'"]\)', image_div["style"])
      event_image_url = "" if not urls else urls[0]

      event_data={
        "title": event_titles[0].text,
        "event_day": start_date.date(),
        "start_time": start_date.time(),
        "event_url": event_url,
        "event_image_url": event_image_url
      }

      self.process_event(ingestion_run=ingestion_run, venue=venue, event_data=event_data, debug=debug)
