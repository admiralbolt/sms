from django.core.management.base import BaseCommand

from api.models import Event, Venue
from api.tasks import import_ticketmaster_data

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")

  def handle(self, *args, **kwargs):
    if kwargs["truncate"]:
      print("Clearing venue AND event data...")
      Event.objects.all().delete()
      Venue.objects.all().delete()

    import_ticketmaster_data()

    
