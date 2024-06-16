from django.core.management.base import BaseCommand

from api.constants import IngestionApis
from api.models import Crawler, Event, IngestionRun
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
      print("Please provide one of --crawler or --all")

    if kwargs["all"]:
      if kwargs["truncate"]:
        result = input("Clearing ALL crawled Event data. Are you SURE? [Y/n]: ")
        if result == "Y":
          Event.objects.filter(event_api=IngestionApis.CRAWLER).delete()
        return
      
      ingestion_run = IngestionRun.objects.create(name="Manual Crawl Data All")
      for crawler_name in venue_utils.all_crawler_names():
        crawl_data(crawler_name=crawler_name, ingestion_run=ingestion_run, debug=kwargs["debug"])
      return
    
    crawler = venue_utils.get_crawler(kwargs["crawler"])
    if not crawler.venue:
      print("No venue associated with the crawler.")
      return
    
    if kwargs["truncate"]:
      Event.objects.filter(venue=crawler.venue, event_api=IngestionApis.CRAWLER).delete()
      return

    ingestion_run = IngestionRun.objects.create(name=f"Manual Crawl Data ({crawler.venue.name})")
    crawl_data(crawler_name=kwargs["crawler"], ingestion_run=ingestion_run, debug=kwargs["debug"])
