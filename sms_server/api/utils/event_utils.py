"""Utils related to Events."""
import logging

import deepdiff

from api.constants import IngestionApis
from api.models import ChangeTypes, Event, Venue
from api.utils import diff_utils

logger = logging.getLogger(__name__)

def get_event(venue: Venue, event_day: str="", start_time: str=""):
  """Get event object by venue, day, and start_time."""
  return Event.objects.filter(venue=venue, event_day=event_day, start_time=start_time).first()

def handle_open_mic_gen_diff(event: Event, values_changed: dict) -> tuple[bool, Event]:
  """Handle open mic event generation for events that are already in the API."""
  if not values_changed:
    return False, event
  
  if values_changed.get("root['event_api']", {}).get("new_value", None) != IngestionApis.OPEN_MIC_GENERATOR:
    return False, event

  return diff_utils.apply_diff(event, values_changed, fields=["event_type", "title", "event_api"])

def create_or_update_event(venue: Venue, debug: bool=False, **kwargs) -> tuple[str, str, Event]:
  """Create or update an event.‘

  Returns a tuple of (change_type, change_log, Event). The change_type will be 
  the changes applied (if any), and the change_log will include more information
  about the changes applied / fields created. The Event returned will be the 
  finalized version of the created or updated Event.
  """
  # Special handling for importing "open mic" events that come from the apis.
  # We want to use the open mic generators instead of the apis directly.
  if kwargs["event_api"] != IngestionApis.OPEN_MIC_GENERATOR and "open mic" in kwargs["title"].lower():
    return ChangeTypes.SKIP, "Skipping because open mics are handled by generators.", None
  
  # Similarly, we want to handle some special cases. We don't want to include
  # trivia or karaoke events.
  if "trivia" in kwargs["title"].lower() or "karaoke" in kwargs["title"].lower():
    return ChangeTypes.SKIP, "Skipping because event is trivia OR karaoke.", None

  # Uniqueness of an event is based on venue, event_day and start_time.
  # Make sure we at least have these.
  if not kwargs.get("event_day", None) or not kwargs.get("start_time", None):
    logger.warning(f"Can't process event, not enough information to proceed. {venue}, {kwargs}")
    return ChangeTypes.SKIP, f"Skipping because there isn't enough info to proceed. {venue=}, {kwargs=}", None

  # If the event doesn't exist, create it and move on.
  event = get_event(venue, kwargs["event_day"], kwargs["start_time"])
  if not event:
    event = Event(venue=venue, **kwargs)
    event.save()
    return ChangeTypes.CREATE, f"Event created {event.__dict__}", event

  # If the event does exist we need to determine what the diffs are, and how
  # to handle them.
  new_event = Event(venue=venue, **kwargs)

  # Compute diffs on the serialized data.
  original_event_data = event.__dict__

  diff = deepdiff.DeepDiff(
    original_event_data,
    new_event.__dict__,
    ignore_order=True,
    exclude_paths=["id"]
  )

  # If brand new fields are added, add them!
  fields_added, _ = diff_utils.handle_new_fields(event, new_event.__dict__, diff)
  values_changed = diff.get("values_changed", None)
  # Handle "new" fields. Cases where old fields are blank / empty strings.
  fields_changed, _ = diff_utils.handle_new_fields_diff(event, values_changed)
  # In some cases open mics are listed as events in the API. When we generate
  # open mic events we want to override the existing event.
  open_mic_diff, _ = handle_open_mic_gen_diff(event, values_changed)

  change_type = ChangeTypes.NOOP
  change_log = ""
  if any([fields_added, fields_changed, open_mic_diff]):
    # Takes some extra effort, but we serialize the final diffs to json.
    final_diff = deepdiff.DeepDiff(
      original_event_data,
      event.__dict__,
      ignore_order=True,
      exclude_paths=["id"]
    )
    change_log = final_diff.to_json()
    event.save()

  return change_type, change_log, event
