from typing import Optional

from api.models import Venue, VenueAlias

def get_proper_name(name: str) -> str:
  alias = VenueAlias.objects.filter(alias=name)
  if alias.exists():
    name = alias.first().proper_name
  return name

def get_venue(name: str, lat_long: Optional[tuple[float, float]]) -> Optional[Venue]:
  name = get_proper_name(name)
  
  # Try to find the venue by name first.
  venue = Venue.objects.filter(name=name)
  if venue.exists():
    return venue.first()
  
  # Then try to find using the lat / long.
  if lat_long:
    venue = Venue.objects.filter(latitude=lat_long[0], longitude=lat_long[1])
    if venue.exists():
      return venue.first()
  
  return None