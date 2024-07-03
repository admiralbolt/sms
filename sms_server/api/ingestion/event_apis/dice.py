"""Dice integration.

Still waiting to hear back from dice about a direct api integration. HOWEVER,
I found their primary api by poking around their site. Event search is done
through a single unprotected endpoint: https://api.dice.fm/unified_search.
"""
from typing import Generator

import requests
from scourgify import normalize_address_record

from api.constants import IngestionApis
from api.ingestion.event_apis.event_api import EventApi

class DiceApi(EventApi):

  has_artists = True

  def __init__(self) -> object:
    super().__init__(api_name=IngestionApis.DICE)

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    venue_data = raw_data["venues"][0]
    address_data = normalize_address_record(venue_data["address"])
    return {
      "name": venue_data["name"],
      "latitude": venue_data["location"]["lat"],
      "longitude": venue_data["location"]["lng"],
      "address": address_data["address_line_1"],
      "city": venue_data["city"]["name"],
      "postal_code": address_data["postal_code"],
      "venue_image_url": (venue_data["image"] or {}).get("url", None),
      "api_id": venue_data["id"]
    }

  def get_event_kwargs(self, raw_data: dict) -> dict:
    event_day, start_time = raw_data["dates"]["event_start_date"].split("T")
    # Need to remove the -07:00 from the start time.
    start_time = start_time[:8]
    return {
      "title": raw_data["name"],
      "event_day": event_day,
      "start_time": start_time,
      "event_url": raw_data["social_links"]["event_share"],
      "event_image_url": raw_data["images"]["landscape"],
      "description": raw_data["about"]["description"]
    }
  
  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    if raw_data["summary_lineup"]["total_artists"] == 0:
      return
    
    for artist in raw_data["summary_lineup"]["top_artists"]:
      yield {
        "name": artist["name"],
        "artist_image_url": artist.get("image", {}).get("url", "")
      }

  def get_raw_data_info(self, raw_data: dict) -> dict:
    event_day, _ = raw_data["dates"]["event_start_date"].split("T")
    return {
      "event_api_id": raw_data["id"],
      "event_name": raw_data["name"],
      "venue_name": raw_data["venues"][0]["name"],
      "event_day": event_day
    }
  
  def get_event_list(self) -> Generator[dict, None, None]:
    raw_data = requests.post(
      "https://api.dice.fm/unified_search",
      json={
        "lat": 47.6062,
        "lng": -122.3321,
        "tag": "music:gig",
        "count": 500,
      },
      headers={
        "Content-Type": "application/json"
      }
    ).json()

    for section in raw_data["sections"]:
      for event in section.get("events", []):
        yield event