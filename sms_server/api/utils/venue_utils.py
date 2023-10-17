"""Utils related to Venues."""

from typing import Optional

from api.models import Venue, VenueAlias, VenueApi

def clear_api_data(api_name: str) -> None:
  """Clear all venue data associated with a paritcular api."""
  venue_apis = VenueApi.objects.filter(api_name=api_name)
  # Gather all venues for potential deletion.
  venues = [venue_api.venue for venue_api in venue_apis]
  VenueApi.filter(api_name=api_name).delete()
  # For each venue, if we deleted an associated API and it was the last one
  # left, we delete the venues.
  for venue in venues:
    if VenueApi.objects.filter(venue=venue).count() > 0:
      continue

    venue.delete()

def get_proper_name(name: str) -> str:
  """Gets the proper name for a venue by replacing aliases if they exist."""
  alias = VenueAlias.objects.filter(alias=name)
  if alias.exists():
    name = alias.first().proper_name
  return name

def get_venue(name: str, latitude: Optional[float], longitude: Optional[float]) -> Optional[Venue]:
  """Attempt to get a venue from name OR latitude / longitude."""
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

def add_venue_api(venue: Venue, api_name: str, api_id: str) -> None:
  """Add venue api if it doesn't already exist."""
  venue_api = VenueApi.objects.filter(venue=venue, api_name=api_name).first()
  if venue_api:
    return

  VenueApi.objects.create(
    venue=venue,
    api_name=api_name,
    api_id=api_id
  )


def get_or_create_venue(name: str, latitude: float, longitude: float, address: str, postal_code: int, city: str, api_name: str, api_id: int) -> Venue:
  """Get or create a venue."""
  venue = get_venue(name, latitude=latitude, longitude=longitude)
  if not venue:
    venue = Venue.objects.create(
      name=get_proper_name(name),
      latitude=latitude,
      longitude=longitude,
      address=address,
      postal_code=postal_code,
      city=city,
    )

  # Get or create an associated venue API record before returning.
  add_venue_api(venue=venue, api_name=api_name, api_id=api_id)
  return venue
