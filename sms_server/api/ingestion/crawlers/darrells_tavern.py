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
from typing import Generator

from bs4 import BeautifulSoup

from api.constants import IngestionApis
from api.ingestion.crawlers.crawler import AbstractCrawler
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

class DarellsTavernCrawler(AbstractCrawler):

  def __init__(self) -> object:
    super().__init__(crawler_name=IngestionApis.CRAWLER_DARRELLS_TAVERN, venue_name_regex="^darrell's tavern$")

  def get_event_kwargs(self, raw_data: dict) -> dict:
    return {
      "title": raw_data["title"],
      "event_day": raw_data["event_day"],
      "start_time": raw_data["start_time"],
      "event_url": raw_data["event_url"],
      "description": raw_data["description"],
    }
  
  def get_artist_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    for artist in raw_data["artists"]:
      yield {
        "name": artist
      }
  
  def get_event_list(self) -> Generator[dict, None, None]:
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

      today = datetime.today()
      # Sometimes, one or both of the date text or artist text has additional
      # information. The date tag can potentially contain updated time, cost,
      # or an event name. The artist text can have additional description
      # text. In all cases, these are split line by line.
      date_info = date_tag.text.split("\n")
      event_dates = [datetime.strptime(d.strip(), "%a %m.%d").replace(year=today.year) for d in date_info[0].split("/")]
      
      for event_date in event_dates:
        # If the event_date is before the current day, that's because it's
        # happening next year!
        if event_date < today:
          event_date = event_date.replace(year=event_date.year + 1)

        show_title = ""
        start_time = "20:00"
        description = ""

        # Then we guess what the rest of the fields are.
        if len(date_info) > 1:
          for extra_info in date_info[1:]:
            if (new_start := parsing_utils.find_time(extra_info)):
              start_time = new_start
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

        yield {
          "title": show_title,
          "event_name": show_title,
          "event_day": event_date.strftime("%Y-%m-%d"),
          "start_time": start_time,
          "event_url": EVENTS_URL,
          "description": description,
          "artist_names": artists,
          "event_api_id": f"{event_date.strftime('%Y-%m-%d')}-{show_title[:30]}"
        }
