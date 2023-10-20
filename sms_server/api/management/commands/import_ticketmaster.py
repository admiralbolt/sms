from django.core.management.base import BaseCommand

from api.models import Event, Venue
from api.tasks import import_ticketmaster_data
from api.utils import venue_utils

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")

  def handle(self, *args, **kwargs):
    if kwargs["truncate"]:
      Event.objects.filter(event_api="Ticketmaster").delete()
      venue_utils.clear_api_data(api_name="Ticketmaster")

    import_ticketmaster_data(debug=kwargs["debug"])

    
