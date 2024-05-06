"""Crawler for the Blue Moon Tavern.

As of 2023-11-06,
Entry point: https://www.thebluemoonseattle.com/calendar

Found some sort of API that's going through WIX. This will be easier to work
with but probably even flakier than querying their website. Though admittedly
their calendar is loaded by some javascript fuckery so it'd probably require
some selenium hacking to make it work well.

https://google-calendar.galilcloud.wixapps.net/_api/getEvents?compId=comp-kurk0gts&instance=Cvx_9zA6zBPvynb5y3Ufq9ti1OwqSvCBaRhAgM9XwtA.eyJpbnN0YW5jZUlkIjoiMDg2NDdkMmEtMmViMC00MzgwLWJmZGItNzA2ZGUzMTQ0ZjE0IiwiYXBwRGVmSWQiOiIxMjlhY2I0NC0yYzhhLTgzMTQtZmJjOC03M2Q1Yjk3M2E4OGYiLCJtZXRhU2l0ZUlkIjoiYjcwNTNhNmYtZDNiZC00Y2Y3LTk1MjUtMDRhYTdhZGZjNDc1Iiwic2lnbkRhdGUiOiIyMDIzLTExLTA3VDA3OjAyOjIzLjgxOFoiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImI1ZDQ1NDEwLTQ3NjktNGMwYS04MGE0LTdjYTNiNjBjMmI3NSIsImJpVG9rZW4iOiJiZjYxNDc0NS1mZDBkLTBmNzctMmFmZS03NGM3OTljYjhiNjEiLCJzaXRlT3duZXJJZCI6ImM0Mzc5Nzk2LWE5YzUtNDVkYi05MGIxLTE2OGZhZTQ0MTQ2NiJ9https://google-calendar.galilcloud.wixapps.net/_api/getEvents?compId=comp-kurk0gts&instance=Cvx_9zA6zBPvynb5y3Ufq9ti1OwqSvCBaRhAgM9XwtA.eyJpbnN0YW5jZUlkIjoiMDg2NDdkMmEtMmViMC00MzgwLWJmZGItNzA2ZGUzMTQ0ZjE0IiwiYXBwRGVmSWQiOiIxMjlhY2I0NC0yYzhhLTgzMTQtZmJjOC03M2Q1Yjk3M2E4OGYiLCJtZXRhU2l0ZUlkIjoiYjcwNTNhNmYtZDNiZC00Y2Y3LTk1MjUtMDRhYTdhZGZjNDc1Iiwic2lnbkRhdGUiOiIyMDIzLTExLTA3VDA3OjAyOjIzLjgxOFoiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImI1ZDQ1NDEwLTQ3NjktNGMwYS04MGE0LTdjYTNiNjBjMmI3NSIsImJpVG9rZW4iOiJiZjYxNDc0NS1mZDBkLTBmNzctMmFmZS03NGM3OTljYjhiNjEiLCJzaXRlT3duZXJJZCI6ImM0Mzc5Nzk2LWE5YzUtNDVkYi05MGIxLTE2OGZhZTQ0MTQ2NiJ9
"""
import logging
import requests

from api.constants import IngestionApis
from api.ingestion.crawlers.crawler import Crawler
from api.models import IngestionRun, Venue
from api.utils import event_utils, parsing_utils

logger = logging.getLogger(__name__)

# Seems like this URL _may_ change. Will need to be careful about this, and
# may need to do some request sniffing to get the correct instance id.
CALENDAR_EVENTS_URL = "https://google-calendar.galilcloud.wixapps.net/_api/getEvents?compId=comp-kurk0gts&instance=Cvx_9zA6zBPvynb5y3Ufq9ti1OwqSvCBaRhAgM9XwtA.eyJpbnN0YW5jZUlkIjoiMDg2NDdkMmEtMmViMC00MzgwLWJmZGItNzA2ZGUzMTQ0ZjE0IiwiYXBwRGVmSWQiOiIxMjlhY2I0NC0yYzhhLTgzMTQtZmJjOC03M2Q1Yjk3M2E4OGYiLCJtZXRhU2l0ZUlkIjoiYjcwNTNhNmYtZDNiZC00Y2Y3LTk1MjUtMDRhYTdhZGZjNDc1Iiwic2lnbkRhdGUiOiIyMDIzLTExLTA3VDA3OjAyOjIzLjgxOFoiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImI1ZDQ1NDEwLTQ3NjktNGMwYS04MGE0LTdjYTNiNjBjMmI3NSIsImJpVG9rZW4iOiJiZjYxNDc0NS1mZDBkLTBmNzctMmFmZS03NGM3OTljYjhiNjEiLCJzaXRlT3duZXJJZCI6ImM0Mzc5Nzk2LWE5YzUtNDVkYi05MGIxLTE2OGZhZTQ0MTQ2NiJ9"

class BlueMoonCrawler(Crawler):

  def __init__(self) -> object:
    super().__init__(crawler_name="blue_moon", venue_name_regex="^blue moon tavern$")

  def get_event_kwargs(self, event_data: dict) -> dict:
    start_time = None
    if "T" in event_data["startDate"]:
      _, start_time = event_data["startDate"].split("T")
      start_time = start_time.split("-")[0]
    ticket_cost = parsing_utils.find_cost(event_data["summary"])
    return {
      "title": event_data["title"],
      "event_day": event_data["day"],
      "start_time": start_time,
      "ticket_price_min": ticket_cost,
      "ticket_price_max": ticket_cost,
    }
  
  def import_data(self, ingestion_run: IngestionRun, debug: bool = False) -> None:
    """Crawl data for the blue moon tavern!!!"""
    headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    all_data = requests.get(CALENDAR_EVENTS_URL, headers=headers, timeout=15).json()
    for day, events in all_data["eventsByDates"].items():
      event_data = events[0]
      event_data["day"] = day
      self.process_event(ingestion_run=ingestion_run, event_data=event_data, debug=debug)
