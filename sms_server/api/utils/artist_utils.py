from typing import Optional

from api.constants import ChangeTypes
from api.models import Artist

def get_artist(name: str) -> Optional[Artist]:
  name_slug = name.lower().replace(" ", "-")
  return Artist.objects.filter(name_slug=name_slug).first()

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
    return ChangeTypes.CREATE, "", artist
  
  # If it does exist, we just return it with no change.
  # Eventually we might do some diffing of things here, but for now artists are
  # basically just keyed by name.
  return ChangeTypes.NOOP, "", artist