from django.core.management.base import BaseCommand

from api.constants import CRAWLERS, CRALWER_TO_ID, IngestionApis
from api.models import Event, Venue
from api.tasks import crawl_venue
from api.utils import venue_utils

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--venue", dest="venue", help="Which API to import data from.")
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")
    parser.add_argument("--all", dest="all", action="store_true", default=False, help="Import data from ALL available sources.")

  def handle(self, *args, **kwargs):
    if not kwargs["venue"] and not kwargs["all"]:
      print("Please provide one of --venue or --all")

    if kwargs["all"]:
      if kwargs["truncate"]:
        result = input("Clearing ALL crawled Event data. Are you SURE? [Y/n]: ")
        if result == "Y":
          Event.objects.filter(event_api=IngestionApis.CRALWER).delete()
      
      for venue_name in CRAWLERS:
        crawl_venue(venue_name=venue_name, debug=kwargs["debug"])
      return


    if kwargs["truncate"]:
      venue = Venue.objects.get(id=CRALWER_TO_ID[kwargs["venue"]])
      Event.objects.filter(venue=venue, event_api=IngestionApis.CRALWER).delete()

    crawl_venue(venue_name=kwargs["venue"], debug=kwargs["debug"])