"""Utils related to Events."""

import datetime
import logging
from typing import Iterable, Optional

import deepdiff
from django.db import models

from api.constants import IngestionApis
from api.ingestion.import_mapping import get_api_priority
from api.models import Artist, ChangeTypes, Event, RawData, Venue
from api.utils import diff_utils

logger = logging.getLogger(__name__)


def get_event(venue: Venue, raw_data: Optional[RawData], event_day: str = "", start_time: str = ""):
  """Get a matching event from the database.

  1) We check to see if we can find an existing event that has the raw data
     attached to it.
  2) If not we make a best guess based on venue, event_day, and start_time.
  """
  if raw_data is not None:
    db_event = Event.objects.filter(raw_datas=raw_data)
    if db_event.exists():
      return db_event.first()

  return Event.objects.filter(venue=venue, event_day=event_day, start_time=start_time).first()


def handle_open_mic_gen_diff(event: Event, values_changed: dict) -> tuple[bool, Event]:
  """Handle open mic event generation for events that are already in the API."""
  if not values_changed:
    return False, event

  if values_changed.get("root['event_api']", {}).get("new_value", None) != IngestionApis.OPEN_MIC_GENERATOR:
    return False, event

  return diff_utils.apply_diff(event, values_changed, fields=["event_type", "title", "event_api"])


def merge_event(to_event: Event, from_event: Event, raw_datas: list[RawData] = [], artists: list[Artist] = []) -> tuple[str, str, Event]:
  """Merge event data.

  Some funny handling needs to happen here. This gets called both from the
  carpenter and the janitor, so the events can either be already finished or
  in a constructing state.
  """
  new_raw_data = False
  # Check list of raw data links on event. If it doesn't include our input
  # raw_data, we need to add it.
  raw_datas = raw_datas if (raw_datas or not from_event.id) else from_event.raw_datas.all()
  for raw_data in raw_datas:
    if not to_event.raw_datas.contains(raw_data):
      raw_data.event = to_event
      raw_data.save()
      new_raw_data = True

  new_artists = []
  # We can't access many to many field values unless there's an ID set on an
  # object.
  artists = artists if (artists or not from_event.id) else from_event.artists.all()
  for artist in artists:
    if not to_event.artists.contains(artist):
      to_event.artists.add(artist)
      new_artists.append(artist)

  # Compute diffs on the serialized data.
  original_event_data = to_event.__dict__

  diff = deepdiff.DeepDiff(
    original_event_data,
    from_event.__dict__,
    ignore_order=True,
    exclude_paths=["_state", "id"],
  )

  # If brand new fields are added, add them!
  fields_added, _ = diff_utils.handle_new_fields(to_event, from_event.__dict__, diff)
  values_changed = diff.get("values_changed", None)
  # Handle "new" fields. Cases where old fields are blank / empty strings.
  fields_changed, _ = diff_utils.handle_new_fields_diff(to_event, values_changed)
  # In some cases open mics are listed as events in the API. When we generate
  # open mic events we want to override the existing event.
  open_mic_diff, _ = handle_open_mic_gen_diff(to_event, values_changed)

  change_type = ChangeTypes.NOOP
  change_log = ""
  if any([fields_added, fields_changed, open_mic_diff]):
    change_type = ChangeTypes.UPDATE
    # Takes some extra effort, but we serialize the final diffs to json.
    final_diff = deepdiff.DeepDiff(original_event_data, to_event.__dict__, ignore_order=True, exclude_paths=["id"])
    change_log = f"{fields_added=}, {fields_changed=}, {open_mic_diff=}\n{final_diff.to_json()}"

  if new_raw_data:
    change_type = ChangeTypes.UPDATE
    change_log += f"\nAdded new raw_data link with id={raw_data.id}"

  if new_artists:
    change_type = ChangeTypes.UPDATE
    for artist in new_artists:
      change_log += f"\nAdded new artist to event ({artist.id}, {artist.name})"

  to_event.save()
  return change_type, change_log, to_event


def create_or_update_event(venue: Venue, raw_data: Optional[RawData], artists: list[Artist] = [], **kwargs) -> tuple[str, str, Event]:
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

  allowed_keys = set([field.name for field in Event._meta.get_fields()])
  allowed_keys.remove("id")
  filtered_kwargs = {key: kwargs[key] for key in kwargs if key in allowed_keys}

  # If the event doesn't exist, create it and move on.
  event = get_event(venue, raw_data, kwargs["event_day"], kwargs["start_time"])
  if not event:
    event = Event(venue=venue, **filtered_kwargs)
    event.save()
    if raw_data is not None:
      raw_data.event = event
      raw_data.save()
    for artist in artists:
      event.artists.add(artist)
    event.save()
    return ChangeTypes.CREATE, f"Event created {event.__dict__}", event

  new_event = Event(venue=venue, **filtered_kwargs)
  return merge_event(event, new_event, raw_datas=[raw_data] if raw_data is not None else [], artists=artists)


def get_highest_priority_api(event: Event) -> tuple[int, str]:
  """Get the highest priority api on an event.

  Really this should be a class method, but we do it in the utils to avoid
  a dependency loop.
  """
  api_info = [(get_api_priority(d.api_name), d.api_name) for d in event.raw_datas.all()]
  if len(api_info) == 0:
    return 100, "UNKNOWN"

  return sorted(api_info, key=lambda item: item[1])[0]


def sort_events_by_priority(event_set: models.Manager[Event]) -> list[Event]:
  return sorted(event_set, key=lambda event: get_highest_priority_api(event))


def should_merge(event_set: Iterable[Event]) -> bool:
  # We assume that all these events have the same day and venue.
  # Check to see if all events start around the same time.
  min_time = datetime.time(23, 59, 0)
  max_time = datetime.time(0, 0, 0)
  for event in event_set:
    if event.start_time < min_time:
      min_time = event.start_time
    if event.start_time > max_time:
      max_time = event.start_time

  now = datetime.datetime.now()
  min_datetime = datetime.datetime.combine(now, min_time)
  max_datetime = datetime.datetime.combine(now, max_time)
  diff_in_minutes = (max_datetime - min_datetime).total_seconds() / 60

  # Set diff to slightly more than an hour and half.
  if diff_in_minutes >= 100:
    return True

  return False


def merge_events(to_event: Event, event_set: Iterable[Event]) -> tuple[str, str, Event]:
  change_type = ChangeTypes.NOOP
  change_log = ""
  for event in event_set:
    if event == to_event:
      continue

    tmp_type, tmp_log, _ = merge_event(to_event, event)
    event.delete()
    if tmp_type == ChangeTypes.UPDATE:
      change_type = tmp_type
    change_log += tmp_log + "\n"

  return change_type, change_log, to_event
