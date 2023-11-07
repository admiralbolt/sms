from django.core.management.base import BaseCommand

from api.constants import IngestionApis
from api.models import Event
from api.tasks import generate_open_mic_events

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")
    parser.add_argument("--name", dest="name", default="", help="Filter for a specific open mic.")

  def handle(self, *args, **kwargs):
    if kwargs["truncate"]:
      Event.objects.filter(event_api=IngestionApis.OPEN_MIC_GENERATOR).delete()
      return

    generate_open_mic_events(name_filter=kwargs["name"])
