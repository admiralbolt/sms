import collections
import logging
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

  def apply_artists(self):
    pass

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
