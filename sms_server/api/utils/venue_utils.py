from typing import Optional

from api.models import Venue, VenueAlias

def get_proper_name(name: str) -> str:
  alias = VenueAlias.objects.filter(alias=name)
  if alias.exists():
    name = alias.first().proper_name
  return name

def get_venue(name: str, latitude: Optional[float], longitude: Optional[float]) -> Optional[Venue]:
  name = get_proper_name(name)
  
  # Try to find the venue by name first.
  venue = Venue.objects.filter(name=name)
  if venue.exists():
    return venue.first()
  
  # Then try to find using the lat / long.
  if latitude and longitude:
    venue = Venue.objects.filter(latitude=latitude, longitude=longitude)
    if venue.exists():
      return venue.first()
  
  return None

def get_or_create_venue(name: str, latitude: float, longitude: float, address: str, postal_code: int, city: str, venue_api: str, venue_api_id: int) -> Venue:
  venue = get_venue(name, latitude=latitude, longitude=longitude)
  if venue:
    return venue
  
  return Venue.objects.create(
    name=get_proper_name(name),
    latitude=latitude,
    longitude=longitude,
    address=address,
    postal_code=postal_code,
    city=city,
    venue_api=venue_api,
    venue_api_id=venue_api_id
  )