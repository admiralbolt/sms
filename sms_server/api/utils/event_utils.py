"""Utils related to Events."""
from typing import Optional

from api.models import Event, Venue


def get_event(venue: Venue, event_day: str="", start_time: str=""):
  """Get event object by venue, day, and start_time."""
  return Event.objects.filter(venue=venue, event_day=event_day, start_time=start_time).first()

def get_or_create_event(venue: Venue, event_type: str="Show", title: str="", event_day: str="", signup_start_time: str="", start_time: str="", ticket_price_min: float=0, ticket_price_max: float=0, event_api: str="", event_url: str = "") -> Event:
  """Get or create an event."""
  event = get_event(venue, event_day, start_time)
  if event:
    return event

  event, _ = Event.objects.get_or_create(
    venue=venue,
    event_type=event_type,
    title=title,
    event_day=event_day,
    signup_start_time=signup_start_time,
    start_time=start_time,
    ticket_price_min=ticket_price_min,
    ticket_price_max=ticket_price_max,
    event_api=event_api,
    event_url=event_url
  )
  return event
