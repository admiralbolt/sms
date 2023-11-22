"""Utils related to Events."""
import logging
from typing import Optional

import deepdiff

from api.constants import IngestionApis
from api.models import Event, Venue
from api.serializers import EventSerializer
from api.utils import diff_utils

logger = logging.getLogger(__name__)

def get_event(venue: Venue, event_day: str="", start_time: str=""):
  """Get event object by venue, day, and start_time."""
  return Event.objects.filter(venue=venue, event_day=event_day, start_time=start_time).first()

def handle_open_mic_gen_diff(event: Event, values_changed: dict) -> Event:
  """Handle open mic event generation for events that are already in the API."""
  if values_changed.get("root['event_api']", {}).get("new_value", None) != IngestionApis.OPEN_MIC_GENERATOR:
    return event
  
  event = diff_utils.apply_diff(event, values_changed, fields=["event_type", "title", "event_api"])

def create_or_update_event(venue: Venue, **kwargs) -> Event:
  """Create or update an event.‘

  We can get conflicting sources of information between APIs, or from a single
  venue -- duplicate events are sometimes created adding "CANCELLED" or
  "SOLD OUT" to the title. Rather than ignoring the differences entirely, we
  want a sane way of handling updates.
  """
  # Special handling for importing "open mic" events that come from the apis.
  # We want to use the open mic generators instead of the apis directly.
  if kwargs["event_api"] != IngestionApis.OPEN_MIC_GENERATOR and "open mic" in kwargs["title"].lower():
    return None

  # Uniqueness of an event is based on venue, event_day and start_time.
  # Make sure we at least have these.
  if not kwargs.get("event_day", None) or not kwargs.get("start_time", None):
    logger.warning(f"Can't process event, not enough information to proceed. {venue}, {kwargs}")
    return None

  # If the event doesn't exist, create it and move on.
  event = get_event(venue, kwargs["event_day"], kwargs["start_time"])
  if not event:
    event = Event(venue=venue, **kwargs)
    event.save()
    return event
  
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

  # If brand new fields are added, add them!
  changed, _ = diff_utils.handle_new_fields(event, new_event_serialized, diff)
  if changed:
    event.save()

  # If there's no diff, nothing else to do!
  values_changed = diff.get("values_changed", None)
  if not values_changed:
    return event
  
  # Otherwise, we need to update the event accordingly based on the diffs.
  # THIS WILL BE COMPLEX.
  # For now, we log the diff!
  logger.warning(f"Event diff detected\n============\n")
  logger.warning(values_changed)
  logger.warning(f"Original event\n===========\n")
  logger.warning(event)

  # Handle "new" fields. Cases where old fields are blank / empty strings.
  diff_utils.handle_new_fields_diff(event, values_changed)

  # In some cases open mics are listed as events in the API. When we generate
  # open mic events we want to override the existing event.
  handle_open_mic_gen_diff(event, values_changed)

  event.save()

  return event