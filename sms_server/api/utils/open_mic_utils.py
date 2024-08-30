"""Utils for generating open mic events!"""

import datetime
from typing import Generator

import croniter

from api.constants import IngestionApis
from api.models import Event, OpenMic, Venue
from api.utils import event_utils


def get_open_mic_by_venue_name(venue_name: str) -> OpenMic:
  """Get an open mic by it's venue name."""
  venue = Venue.objects.filter(name=venue_name).first()
  if not venue:
    return None

  return OpenMic.objects.filter(venue=venue).first()


def generate_open_mic_events(
  open_mic: OpenMic, max_diff: datetime.timedelta = datetime.timedelta(days=45)
) -> Generator[tuple[str, str, Event], None, None]:
  """Generate calendar events for an open mic.

  Dates are generated based on the open mics cadence crontab, starting from the
  current time. The dates generated are bounded by the max_diff timedelta.
  """
  now = datetime.datetime.now()
  # Crontab conditionals are logical OR not logical AND. So a crontab like:
  # 0 0 8-14,22-28 * THU, actually generates for all thursdays, AND for days
  # that are numbered 8-14, 22-28. Thankfully we can just specify day_or=False
  date_generator = croniter.croniter(open_mic.cadence_crontab, now, day_or=False)
  while next_date := date_generator.get_next(datetime.datetime):
    if (next_date - now) > max_diff:
      break

    yield event_utils.create_or_update_event(
      venue=open_mic.venue,
      raw_data=None,
      event_type=open_mic.event_mic_type,
      title=open_mic.name(),
      event_day=next_date.date(),
      signup_start_time=open_mic.signup_start_time,
      start_time=open_mic.event_start_time,
      event_api=IngestionApis.OPEN_MIC_GENERATOR,
    )
