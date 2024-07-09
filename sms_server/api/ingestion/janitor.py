import collections
import logging
import time
import traceback
from datetime import datetime, timedelta
from typing import Optional

from api.constants import get_all, JanitorOperations
from api.ingestion.event_apis.event_api import EventApi
from api.ingestion.import_mapping import API_MAPPING, API_PRIORITY_LIST
from api.models import Artist, Event, JanitorRun, JanitorRecord, JanitorApplyArtistRecord, JanitorMergeEventRecord
from api.utils import artist_utils, event_utils, venue_utils

logger = logging.getLogger(__name__)

class Janitor:
  """Clean some data!"""

  def __init__(self, operations: Optional[list[str]]=None, min_date: Optional[datetime]=None, process_all: bool=False):
    all_janitor_ops = get_all(JanitorOperations)
    self.operations = [op for op in operations if op in all_janitor_ops] if operations else all_janitor_ops
    if len(self.operations) == 0:
      raise ValueError("No operations provided.")
    self.min_date = datetime.now() - timedelta(days=1) if not min_date else min_date
    self.process_all = process_all

    run_name = "Janitor Run "
    if not operations:
      run_name += "- All Operations "
    else:
      run_name += f"- {', '.join(self.operations)} "

    run_name += f"- {min_date} "
    run_name += f"- {process_all=}"

    self.janitor_run = JanitorRun.objects.create(name=run_name)

  def merge_events(self):
    pass

  def should_add_artist(self, artist: Artist, event: Event) -> bool:
    # Special exception for this band that made their name "@".
    # They are now my number one enemy.
    if artist.name == "@":
      return False
    
    # NOTE to future me, this is actually a perfect spot to use a modified
    # Aho-Corasick, but for now we just do it the lazy way.
    if event.artists.contains(artist):
      return False
    
    name_lower = artist.name.lower()
    event_lower = event.title.lower()
    if not name_lower in event_lower:
      return False
    
    # We want a FULL match of the text, not just any substring. So, if we have
    # a match, check the character on either side of the match. If it's any
    # alpha character [a-z] we don't consider it a full match.
    pos = event_lower.index(name_lower)

    if pos > 0 and event_lower[pos - 1].isalpha():
      return False
    
    n_len = len(name_lower)
    e_len = len(event_lower)
    if pos + n_len < e_len and event_lower[pos + n_len].isalpha():
      return False

    return True

  def apply_artists(self):
    """Apply artists retroactively to shows.

    Many APIs don't include information about performers, but we can apply them
    if their name shows up in the title, by cross checking with our good list
    of artist names pulled from trusted APIs.
    """
    all_events = Event.objects.filter(event_day__gt=self.min_date)
    all_artists = Artist.objects.all()
    for event in all_events:
      artists_added = []
      for artist in all_artists:
        if self.should_add_artist(artist, event):
          event.artists.add(artist)
          artists_added.append(artist)

      if len(artists_added) == 0:
        continue
      
      event.save()
      apply_artists_record = JanitorApplyArtistRecord.objects.create(event=event)
      apply_artists_record.artists.add(*artists_added)
      apply_artists_record.save()
      JanitorRecord.objects.create(
        janitor_run=self.janitor_run,
        operation=JanitorOperations.APPLY_ARTISTS,
        change_log=f"Added artists [{', '.join([str((artist.id, artist.name)) for artist in artists_added])}] to event: {(event.id, event.title)}",
        apply_artists_record=apply_artists_record
      )

  def finalize_events(self):
    Event.objects.filter(finalized=False).update(finalized=False)

  def run(self):
    """Is your janitor running???"""
    #1. Merge events.
    self.merge_events()

    #2. Apply artists.
    self.apply_artists()

    # Mark all previously unfinalized events as finalized.
    self.finalize_events()
