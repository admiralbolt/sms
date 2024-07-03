from typing import Optional

from api.constants import ChangeTypes
from api.models import Artist, SocialLink

def get_artist(name: str) -> Optional[Artist]:
  name_slug = name.lower().replace(" ", "-")
  return Artist.objects.filter(name_slug=name_slug).first()

def create_or_update_socials(artist: Artist, social_links: list[dict[str, str]]) -> str:
  """Check me out on insta!"""
  if not social_links:
    return ChangeTypes.SKIP, "", []

  existing_links = SocialLink.objects.filter(artist=artist)
  log = ""

  for arg_link in social_links:
    existing_link = existing_links.filter(platform=arg_link["platform"].lower()).first()
    if existing_link:
      # Not sure if we should actually accept updates to urls from other places.
      # For now we just skip.

      # log += f"Updated social link {existing_link}. URL Changed from '{existing_link.url}' -> '{arg_link['url']}'\n"
      # existing_link.url = arg_link["url"]
      # existing_link.save()
      continue

    link = SocialLink.create(
      artist=artist,
      platform=arg_link["platform"].lower(),
      url=arg_link["url"]
    )
    log += f"Created new social link {link}.\n"

  return log
  

def create_or_update_artist(**kwargs) -> tuple[str, str, Artist]:
  """Create or update raw data.

  Returns a tuple of (change_type, change_log, Artist).
  """
  # Remove leading / trailing spaces from the name.
  kwargs["name"] = kwargs["name"].strip()
  allowed_keys = set([field.name for field in Artist._meta.get_fields()])
  allowed_keys.remove("id")
  filtered_kwargs = {key: kwargs[key] for key in kwargs if key in allowed_keys}
  artist = get_artist(name=kwargs["name"])

  if not artist:
    # If artist doesn't exist, create and return it.
    artist = Artist.objects.create(**filtered_kwargs)
    log = ""
    # Not in filtered kwargs since 'social_links' isn't a valid attribute of artists.
    if "social_links" in kwargs:
      log = create_or_update_socials(artist, kwargs["social_links"])
    return ChangeTypes.CREATE, log, artist
  
  # If it does exist, see if we can add *new* socials to it.
  log = ""
  if "social_links" in kwargs:
    log = create_or_update_socials(artist, kwargs["social_links"])
    if log:
      return ChangeTypes.UPDATE, log, artist
    
  # Annnnnd we're done!
  return ChangeTypes.NOOP, "", artist