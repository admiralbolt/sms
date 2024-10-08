from typing import Optional

from api.constants import ChangeTypes
from api.models import Artist, SocialLink


def get_artist(name: str) -> Optional[Artist]:
  name_slug = name.lower().replace(" ", "-")
  return Artist.objects.filter(name_slug=name_slug).first()


def update_socials(artist: Artist, social_links: list[dict]) -> None:
  """Update socials for an artist to an exact set.

  This method potential creates and/or deletes social links.
  """
  db_links = SocialLink.objects.filter(artist=artist)

  # Create/update links from the input set.
  for link in social_links:
    if "id" in social_links:
      db_link = SocialLink.objects.filter(id=link["id"])
      # If we pass an id, but it doesn't exist, who knows what to do.
      if not db_link.exists():
        continue

      db_link = db_link.first()
      if db_link.url != link["url"]:
        db_link.url = link["url"]
        db_link.save()

      continue

    SocialLink.objects.create(artist=artist, platform=link["platform"], url=link["url"])

  # Remove excess db links.
  input_platforms = set([link["platform"] for link in social_links])
  for db_link in db_links:
    if db_link.platform not in input_platforms:
      db_link.delete()


def create_or_update_socials(artist: Artist, social_links: list[dict[str, str]]) -> str:
  """Check me out on insta!"""
  if not social_links:
    return ""

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

    link = SocialLink.objects.create(artist=artist, platform=arg_link["platform"].lower(), url=arg_link["url"])
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
  allowed_keys.remove("social_links")
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

  log = ""
  # See if we can add *new* socials to it.
  if "social_links" in kwargs:
    log = create_or_update_socials(artist, kwargs["social_links"])
    if log:
      return ChangeTypes.UPDATE, log, artist

  # If the image is blank, see if we can add an image.
  if "artist_image_url" in kwargs and not artist.artist_image:
    artist.artist_image_url = kwargs["artist_image_url"]
    artist.save()
    log += f"Added image '{kwargs['artist_image_url']}'.\n"

  # Annnnnd we're done!
  return ChangeTypes.NOOP, "", artist
