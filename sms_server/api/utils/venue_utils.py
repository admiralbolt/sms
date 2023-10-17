"""Utils related to Venues."""
from api.models import Venue, VenueMask, VenueApi

def clear_api_data(api_name: str) -> None:
  """Clear all venue data associated with a paritcular api."""
  venue_apis = VenueApi.objects.filter(api_name=api_name)
  # Gather all venues for potential deletion.
  venues = [venue_api.venue for venue_api in venue_apis]
  VenueApi.objects.filter(api_name=api_name).delete()
  # For each venue, if we deleted an associated API and it was the last one
  # left, we delete the venues.
  for venue in venues:
    if VenueApi.objects.filter(venue=venue).count() > 0:
      continue

    venue.delete()

def apply_mask(venue: Venue) -> Venue:
  """Applies venue masks to the input venue."""
  for mask in VenueMask.objects.all():
    if not mask.should_apply(venue):
      continue

    venue.name = mask.proper_name
    if mask.latitude:
      venue.latitude = mask.latitude
    if mask.longitude:
      venue.longitude = mask.longitude
    if mask.address:
      venue.address = mask.address

  return venue

def _get_or_create_venue(venue: Venue) -> Venue:
  """See if a venue exists."""
  db_venue = Venue.objects.filter(name=venue.name)
  if db_venue.exists():
    return db_venue.first()

  if venue.latitude and venue.longitude:
    db_venue = Venue.objects.filter(latitude=venue.latitude, longitude=venue.longitude)
    if db_venue.exists():
      return db_venue.first()

  venue.save()
  return venue

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

def get_or_create_venue(name: str, latitude: float=0, longitude: float=0, address: str="", postal_code: int=0, city: str="", api_name: str="", api_id: int=0) -> Venue:
  """Get or create a venue.

  We make the dangerous assumption here, that if you don't supply the proper
  values for a particular field, they will be inherited via a mask properly.
  """
  venue = _get_or_create_venue(apply_mask(Venue(
      name=name,
      latitude=latitude,
      longitude=longitude,
      address=address,
      postal_code=postal_code,
      city=city,
    )))

  # Get or create an associated venue API record before returning.
  add_venue_api(venue=venue, api_name=api_name, api_id=api_id)
  return venue
