from django.core.management.base import BaseCommand

from api.constants import IngestionApis
from api.models import Event, Venue, VenueApi
from api.tasks import crawl_data
from api.utils import venue_utils

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--crawler", dest="crawler", help="Which API to import data from.")
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")
    parser.add_argument("--all", dest="all", action="store_true", default=False, help="Import data from ALL available sources.")

  def handle(self, *args, **kwargs):
    if not kwargs["crawler"] and not kwargs["all"]:
      print("Please provide one of --venue or --all")

    if kwargs["all"]:
      if kwargs["truncate"]:
        result = input("Clearing ALL crawled Event data. Are you SURE? [Y/n]: ")
        if result == "Y":
          Event.objects.filter(event_api=IngestionApis.CRALWER).delete()
      
      venue_apis = VenueApi.objects.filter(api_name=IngestionApis.CRAWLER)
      for venue_api in venue_apis:
        crawl_method = venue_utils.get_crawl_function(venue_api.crawler_name)
        crawl_method(debug=kwargs["debug"])
      return
    
    venue, crawl_method = venue_utils.get_crawler_info(kwargs["crawler"])
    if kwargs["truncate"]:
      Event.objects.filter(venue=venue, event_api=IngestionApis.CRALWER).delete()

    crawl_method(debug=kwargs["debug"])