from api.models import Show, Venue
from bs4 import BeautifulSoup
import requests

from celery import shared_task

SUNSET_TAVERN_TICKETMASTER_ID = "KovZpap2ne"
SUNSET_TAVERN_INTERNAL_ID = 3

@shared_task
def crawl_sunset():
  sunset_venue = Venue.objects.get(id=SUNSET_TAVERN_INTERNAL_ID)
  r = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?venueId=KovZpap2ne&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ&size=200")
  data = r.json()
  # Parsing this garbage is gonna suck.

  for event in data["_embedded"]["events"]:
    # Check to see if we have an event on the particular day already.
    # Eventually this will need to get smarter because of conflicts, but for
    # now it can be dumb.
    already_exists = Show.objects.filter(venue=sunset_venue, show_day=event["dates"]["start"]["localDate"])
    if already_exists.count() > 0:
      continue
    
    show = Show(
      venue=sunset_venue,
      title=event["name"],
      show_day=event["dates"]["start"]["localDate"],
      start_time=event["dates"]["start"]["localTime"],
      ticket_price=event["priceRanges"][0]["max"]
    )
    print(show)
    show.save()
    print("AHA")






  
