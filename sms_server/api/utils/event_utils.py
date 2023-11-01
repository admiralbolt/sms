"""Utils related to Events."""
import logging

import deepdiff

from api.models import Event, Venue
from api.serializers import EventSerializer

logger = logging.getLogger(__name__)

def get_event(venue: Venue, event_day: str="", start_time: str=""):
  """Get event object by venue, day, and start_time."""
  return Event.objects.filter(venue=venue, event_day=event_day, start_time=start_time).first()

def create_or_update_event(venue: Venue, **kwargs) -> Event:
  """Create or update an event.

  We can get conflicting sources of information between APIs, or from a single
  venue -- duplicate events are sometimes created adding "CANCELLED" or
  "SOLD OUT" to the title. Rather than ignoring the differences entirely, we
  want a sane way of handling updates.
  """
  # Uniqueness of an event is based on venue, event_day and start_time.
  # Make sure we at least have these.
  if not kwargs.get("event_day", None) or not kwargs.get("start_time", None):
    logger.warning(f"Can't process event, not enough information to proceed. {venue}, {kwargs}")
    return None

  # If the event doesn't exist, create it and move on.
  event = get_event(venue, kwargs["event_day"], kwargs["start_time"])
  if not event:
    return Event.objects.create(venue=venue, **kwargs)
  
  # If the event does exist we need to determine what the diffs are, and how
  # to handle them.
  new_event = Event(venue=venue, **kwargs)

  # Compute diffs on the serialized data.
  old_event_serialized = EventSerializer(event)
  new_event_serialized = EventSerializer(new_event)

  diff = deepdiff.DeepDiff(
    old_event_serialized.data,
    new_event_serialized.data,
    ignore_order=True,
    exclude_paths=["id"]
  )

  # If there's no diff, nothing else to do!
  if not diff.get("values_changed", None):
    return event
  
  # Otherwise, we need to update the event accordingly based on the diffs.
  # THIS WILL BE COMPLEX.
  # For now, we log the diff!
  logger.warning(f"Event diff detected\n============\n")
  logger.warning(diff.get("values_changed"))
  logger.warning(f"Original event\n===========\n")
  logger.warning(event)

  return event