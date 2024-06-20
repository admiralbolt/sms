"""Crawler for the little red hen!

http://www.littleredhen.com/pages/cal.html -- which you should go and admire
their website if you haven't seen it before. It's a beautiful relic of a
forgotten internet age.

Their calendar is divided into pages by month, no single giant list of events,
so we need to pull an appropriate calendar based on the current day.

Bands start at 9pm.

Sunday/Monday/Tuesday/Wednesday are always the same schedule --
Sunday is open mic (with occasional special events!)
Monday is line dance practice
Tuesday is bluegrass jam
Wednesday is karaoke

Thursday/Friday/Saturday have bands.
"""
import logging
import os
import requests
from datetime import datetime, timedelta
from typing import Generator, Optional

from bs4 import BeautifulSoup

from api.constants import IngestionApis
from api.ingestion.crawlers.crawler import AbstractCrawler
from api.utils import parsing_utils

logger = logging.getLogger(__name__)


# NOTE! They do NOT have ssl setup. The http:// is not a typo.
HEN_CAL_BASE = "http://www.littleredhen.com/pages/"
HEN_CAL_START = os.path.join(HEN_CAL_BASE, "cal.html")

# Don't import events that are more than 30 days in advance.
DAYS_LOOKAHEAD = 30

headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

class Calendar:
  """Abstracting a calendar page since we need to parse multiple."""
  url: str
  soup: BeautifulSoup
  month: str
  month_number: int
  year: int
  is_next_year: bool = False

  def __init__(self, url: str, is_next_year: bool=False):
    self.url = url
    self._initialize()

  def _initialize(self):
    self.soup = BeautifulSoup(requests.get(self.url, headers=headers, timeout=15).text, "html.parser")

    for tag in self.soup.find_all(lambda tag: tag.name == "p" and "entertainment calendar" in tag.text.lower()):
      # Text looks like "Entertainment Calendar | April 2024"
      self.month = tag.text.split("|")[1].strip().split()[0]
      self.month_number = datetime.strptime(self.month, "%B").month
      break

    today = datetime.today()
    self.year = today.year + 1 if self.is_next_year else today.year

  # Funny typing here, self reference typing isn't added until python 3.11 :(
  def get_next_calendar(self) -> Optional["Calendar"]:
    # Search for all <a> tags that have the "next month" text in them.
    for a_tag in self.soup.find_all("a", href=True):
      if "next month" not in a_tag.text.lower():
        continue

      is_next_year = self.is_next_year or self.month_number == 12
      return Calendar(url=os.path.join(HEN_CAL_BASE, os.path.basename(a_tag["href"])), is_next_year=is_next_year)

    logger.error(f"Could not load next months calendar from {self.url}")
    return None
  
  def get_events(self) -> Generator[tuple[datetime, str, int], None, None]:
    start_parsing = False
    for row in self.soup.find_all("tr"):
      if all([day in row.text.lower() for day in ["sunday", "monday", "tuesday"]]):
        start_parsing = True
        continue

      if not start_parsing:
        continue

      for i, td in enumerate(row.find_all("td")):
        # We only want to parse data from Thursday/Friday/Saturday, aka only
        # events with index 4, 5, 6.
        if i <= 3:
          continue

        info = td.text.strip().split("\n")
        if len(info) < 3:
          continue

        day, band, cost, *_ = info
        yield (
          datetime(year=self.year, month=self.month_number, day=int(day)),
          band,
          parsing_utils.find_cost(cost)
        )

class LittleRedHenCrawler(AbstractCrawler):
  """Crawl data for the little red hen!"""

  def __init__(self) -> object:
    super().__init__(crawler_name=IngestionApis.CRAWLER_LITTLE_RED_HEN, venue_name_regex="^little red hen$")

  def get_event_kwargs(self, event_data: dict) -> dict:
    return event_data
  
  def get_event_list(self) -> Generator[dict, None, None]:
    """Gets all events from little red hen calendars."""
    calendar = Calendar(url=HEN_CAL_START)
    if not calendar:
      logger.error(f"Could not load calendar {HEN_CAL_START}")

    today = datetime.today()
    max_event_date = datetime.today()
    while (max_event_date - today) < timedelta(days=DAYS_LOOKAHEAD):
      for day, band, cost in calendar.get_events():
        if today.date() > day.date():
          continue

        event_data = {
          "title": band,
          "event_name": band,
          "event_day": day.strftime("%Y-%m-%d"),
          "event_api_id": f"{day.strftime('%Y-%m-%d')}-{band[:30]}",
          "ticket_price_min": cost,
          "ticket_price_max": cost,
          "event_url": calendar.url,
        }
        max_event_date = day
        yield event_data
      # Exhausted all of this calendars data without hitting the lookahead.
      # Load the next calendar
      calendar = calendar.get_next_calendar()
      if calendar is None:
        return

