from django.core.management.base import BaseCommand

from api.models import Venue
from api.utils import venue_utils


class Command(BaseCommand):
  """Command for running venue_utils.merge_venues.

  Both input args --from_venue and --to_venue should be ids of venues to merge.
  """

  def add_arguments(self, parser):
    parser.add_argument("--from_venue", type=int, help="ID of the venue to merge info from.")
    parser.add_argument("--to_venue", type=int, help="ID of the venue to merge info to.")
    parser.add_argument("--all", default=False, action="store_true", help="Perform alias matching and merging for all venues.")

  def handle(self, *args, **kwargs):
    if not kwargs["all"] and (not kwargs["from_venue"] and not kwargs["to_venue"]):
      print("Please provide one of --all or (--from_venue, and --to_venue)")
      return

    if kwargs["all"]:
      venue_utils.check_aliasing_and_merge_all()
      return

    try:
      from_venue = Venue.objects.get(id=kwargs["from_venue"])
    except:
      print(f"Could not find venue with id {kwargs['from_venue']}")
      return

    try:
      to_venue = Venue.objects.get(id=kwargs["to_venue"])
    except:
      print(f"Could not find venue with id {kwargs['to_venue']}")
      return

    venue_utils.merge_venues(from_venue=from_venue, to_venue=to_venue)
