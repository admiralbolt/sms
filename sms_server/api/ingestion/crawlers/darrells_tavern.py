"""
DARRELLS TAVERN. TWO Rs AND TWO Ls.

As of 2024-05-06, main entry point is: https://darrellstavern.com/show-calendar/.

It should also be noted, that the tags are *NOT* closed properly, so the html
is technically malformed. Which is really cool, nice job Darrell's.

Finally, shows are 8pm, and $10 unless otherwise specified.
"""
import logging
import requests
from datetime import datetime

from bs4 import BeautifulSoup

from api.ingestion.crawlers.crawler import Crawler
from api.models import IngestionRun
from api.utils import parsing_utils

logger = logging.getLogger(__name__)

EVENTS_URL = "https://darrellstavern.com/show-calendar/"

def _get_first_uppercase_letters(text: str) -> str:
  """Don't ask why this is necessary, I'd recommend not reading this code."""
  for i, c in enumerate(text):
    if not c.isalpha():
      if c == " ":
        continue

      return text[:i - 1]

    if not c.isupper():
      return text[:i - 1]

  return text

class DarellsTavernCrawler(Crawler):

  def __init__(self) -> object:
    super().__init__(crawler_name="darrells_tavern", venue_name_regex="^darrell's tavern$")

  def get_event_kwargs(self, event_data: dict) -> dict:
    return event_data
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    """Crawl data for Darell's!!!"""
    headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    darells_request = requests.get(EVENTS_URL, headers=headers, timeout=15)
    soup = BeautifulSoup(darells_request.text, "html.parser")
    # Should only be a single div with entry-content class.
    show_content = soup.find_all("div", class_="entry-content")
    # Show dates are always in h1. Some main content is also in h1's, and 
    # sometimes the show dates also include an updated time.
    show_date_tags = show_content[0].find_all("h1")
    for date_tag in show_date_tags:
      # STRAP IN.
      # Because of how malformed their page is, parsing it is a little funny.
      # The first date tag found is for their sunday night jazz jam.
      # The second date tag found is for their dj night, but because of not
      # properly closing tags, the next <p> sibling is the ENTIRE rest of the
      # content. We want to skip these, and only parse date tags that are
      # actually dates, and only have siblings that are actually artists.
      if any([t in date_tag.text.lower() for t in ["jazz jam", "dj night"]]):
        continue

      # Sometimes, one or both of the date text or artist text has additional
      # information. The date tag can potentially contain updated time, cost,
      # or an event name. The artist text can have additional description
      # text. In all cases, these are split line by line.
      date_info = date_tag.text.split("\n")
      today = datetime.today()
      # The 0th index is ALWAYS the date.
      event_date = datetime.strptime(date_info[0], "%a %m.%d").replace(year=today.year)
      # If the event_date is before the current day, that's because it's
      # happening next year!
      if event_date < today:
        event_date = event_date.replace(year=event_date.year + 1)

      ticket_price = 10
      show_title = ""
      start_time = "20:00"
      description = ""

      # Then we guess what the rest of the fields are.
      if len(date_info) > 1:
        for extra_info in date_info[1:]:
          if (new_start := parsing_utils.find_time(extra_info)):
            start_time = new_start
            continue

          if (new_cost := parsing_utils.find_cost(extra_info)):
            ticket_price = new_cost
            continue

          show_title = f"{extra_info} - "

      # We find the artists playing but looking at the next sibling <p> tag
      artist_text = date_tag.find_next("p").text
      # Artists are split line by line, and occasionally there is extra
      # description text in here.
      artists = []
      for potential_artist in artist_text.split("\n"):
        # Artists are always uppercase, descriptions are not.
        if potential_artist.isupper():
          artists.append(potential_artist.title())
          continue

        # If it's not fully capitalized it could either be an artist with
        # extra description about them, OR actual description text.
        maybe = _get_first_uppercase_letters(potential_artist)
        if len(maybe) >= 3:
          artists.append(maybe.title())
        else:
          description += potential_artist
      
      show_title += ", ".join(artists)

      event_data={
        "title": show_title,
        "event_day": event_date,
        "start_time": start_time,
        "event_url": EVENTS_URL,
        "description": description,
        "ticket_price_min": ticket_price,
        "ticket_price_max": ticket_price,
      }

      self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)