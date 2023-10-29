"""Schedulable / repeatable tasks for data gathering and processing."""
import datetime

from celery import shared_task

from api.models import OpenMic
from api.ingestion import axs, eventbrite, ticketmaster, tixr, venuepilot
from api.utils import open_mic_utils

@shared_task
def generate_open_mic_events(name_filter: str="", max_diff: datetime.timedelta = datetime.timedelta(days=45), debug: bool=False):
  """Generate events for open mics."""
  if name_filter:
    mic = open_mic_utils.get_open_mic_by_venue_name(name_filter)
    if not mic:
      print(f"Couldn't find open mic with name = {name_filter}")
      return

  open_mics = [mic] if name_filter else OpenMic.objects.all()
  for mic in open_mics:
    # Make sure we only generate events for mics that have a venue attached.
    if not mic.venue:
      continue
    open_mic_utils.generate_open_mic_events(mic, max_diff=max_diff)


@shared_task
def import_axs_data(debug: bool=False):
  """Import data from AXS api."""
  axs.import_data(debug=debug)

@shared_task
def import_eventbrite_data(debug: bool=False):
  """Import data from eventbrite api."""
  eventbrite.import_data(debug=debug)

@shared_task
def import_ticketmaster_data(debug: bool=False):
  """Import data from ticketmaster api."""
  ticketmaster.import_data(debug=debug)

@shared_task
def import_tixr_data(debug: bool=False):
  """Import data from TIXR api."""
  tixr.import_data(debug=debug)

@shared_task
def import_venuepilot_data(debug: bool=False):
  """Import data from venuepilot api."""
  venuepilot.import_data(debug=debug)

@shared_task
def import_all(debug: bool=False):
  """Import data from ALL APIs."""
  import_axs_data(debug=debug)
  import_eventbrite_data(debug=debug)
  import_ticketmaster_data(debug=debug)
  import_tixr_data(debug=debug)
  import_venuepilot_data(debug=debug)
