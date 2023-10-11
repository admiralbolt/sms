import requests

from api.models import Event, Venue
from celery import shared_task
from pprint import pprint
from sms_server import settings

def event_request(page=0):
  return requests.get(f"https://app.ticketmaster.com/discovery/v2/events?apikey={settings.TICKET_MASTER_API_KEY}&radius=10&unit=miles&segmentName=Music&geoPoint=c22zp&page={page}").json()

def get_or_create_venue(data):
  if len(data["_embedded"]["venues"]) > 1:
    print("HUH")
    pprint(data)

  venue_data = data["_embedded"]["venues"][0]

  # Try to match an existing venue based on longitude and latitude first.
  # We do it this way because occasionally there are venues with different
  # names that have the same latitude / longitude.
  try:
    return Venue.objects.get(
      latitude=venue_data["location"]["latitude"],
      longitude=venue_data["location"]["longitude"]
    )
  except Exception as e:
    pass

  # Then we attempt to match based on venue name.
  # Same reason as above, occasionally there are duplicate venue entries with
  # slightly different lat/long.
  try:
    return Venue.objects.get(name=venue_data["name"])
  except Exception as e:
    pass
  
  venue = Venue.objects.create(
    name=venue_data["name"],
    latitude=venue_data["location"]["latitude"],
    longitude=venue_data["location"]["longitude"],
    address=", ".join([venue_data["address"][line] for line in sorted(venue_data["address"].keys())]),
    postal_code=venue_data["postalCode"],
    city=venue_data["city"]["name"],
    venue_api="Ticketmaster",
    venue_api_id=venue_data["id"]
  )
   
  return venue


def create_or_update_events(events) -> None:
  for event in events["_embedded"]["events"]:
    # Create venues based on the shows first.
    venue = get_or_create_venue(event)
    # Then create the actual events.
    try:
      event, created = Event.objects.get_or_create(
        venue=venue,
        title=event["name"],
        event_day=event["dates"]["start"]["localDate"],
        start_time=event["dates"]["start"].get("localTime", None),
        ticket_price_min=0 if "priceRanges" not in event else event["priceRanges"][0]["min"],
        ticket_price_max=0 if "priceRanges" not in event else event["priceRanges"][0]["max"],
      )
    except Exception as e:
      print(e)


def import_data():
  events = event_request(page=0)
  num_pages = events["page"]["totalPages"]
  print(f"Expecting a total of {events['page']['size'] * num_pages} events.")
  create_or_update_events(events)
  for page in range(1, num_pages):
    events = event_request(page=page)
    create_or_update_events(events)