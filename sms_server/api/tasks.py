import requests

from api.models import Show, Venue
from bs4 import BeautifulSoup
from celery import shared_task
from pprint import pprint
from sms_server import settings

SUNSET_TAVERN_TICKETMASTER_ID = "KovZpap2ne"
SUNSET_TAVERN_INTERNAL_ID = 3

TRACTOR_TAVERN_TICKETMASTER_ID = "KovZpZAdnvnA"
TRACTOR_TAVERN_INTERNAL_ID = 2

NECTAR_INTERNAL_ID = 5
NECTAR_TICKETMASTER_ID = "KovZpapCme"

HIGH_DIVE_INTERNAL_ID = 4
HIGH_DIVE_TICKETMASTER_ID = "KovZpZAaIElA"

def crawl_ticketweb(venue_id, ticketweb_id):
  venue = Venue.objects.get(id=venue_id)
  r = requests.get(f"https://app.ticketmaster.com/discovery/v2/events.json?venueId={ticketweb_id}&apikey={settings.TICKET_MASTER_API_KEY}&size=200")
  data = r.json()
  # Parsing this garbage is gonna suck.

  print(f"Found {len(data['_embedded']['events'])} shows.")
  for i, event in enumerate(data["_embedded"]["events"]):
    print(f"parsing event {i} => {event['name']}")
    # Check to see if we have an event on the particular day already.
    # Eventually this will need to get smarter because of conflicts, but for
    # now it can be dumb.
    already_exists = Show.objects.filter(venue=venue, show_day=event["dates"]["start"]["localDate"])
    if already_exists.count() > 0:
      continue

    try:
      show = Show(
        venue=venue,
        title=event["name"],
        show_day=event["dates"]["start"]["localDate"],
        start_time=event["dates"]["start"]["localTime"],
        ticket_price=0 if "priceRanges" not in event else event["priceRanges"][0]["max"]
      )
      show.save()
    except:
      print("ERROR PARSING SHOW")
      pprint(event)
      print("=============\n\n\n\n\n\n")

@shared_task
def crawl_sunset():
  crawl_ticketweb(SUNSET_TAVERN_INTERNAL_ID, SUNSET_TAVERN_TICKETMASTER_ID)


@shared_task
def crawl_tractor():
  crawl_ticketweb(TRACTOR_TAVERN_INTERNAL_ID, TRACTOR_TAVERN_TICKETMASTER_ID)


@shared_task
def crawl_nectar():
  crawl_ticketweb(NECTAR_INTERNAL_ID, NECTAR_TICKETMASTER_ID)


@shared_task
def crawl_highdive():
  crawl_ticketweb(HIGH_DIVE_INTERNAL_ID, HIGH_DIVE_TICKETMASTER_ID)
  
