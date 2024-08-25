"""slug"""
import re

def make_slug(name: str) -> str:
  slug = name.lower()
  # Replace anything that isn't an alpha numeric character.
  re.sub("[^a-z0-9]+", "", slug)
  slug = slug.replace(" ", "-")

  return slug