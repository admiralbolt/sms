"""Utils for parsing garbage data from the APIs."""

import re
from typing import Optional

COST_REGEX = r"\$([0-9]+(\.[0-9]+)?)"
NO_COVER_REGEX = "(no cover)"

TIME_REGEX = r"([0-9][0-9]?:[0-9][0-9] [ap]m)"


def parse_cost(cost: str) -> float:
  """Parse ticket cost field."""
  if cost.startswith("$"):
    cost = cost[1:]

  if not cost:
    return 0

  return float(cost)


def find_cost(description: str) -> Optional[float]:
  """Find a ticket cost from a description field.

  In some cases costs aren't a first class field, but are just mentioned in the
  description of a particular event.
  """
  match = re.search(NO_COVER_REGEX, description, flags=re.IGNORECASE)
  if match:
    return 0

  match = re.search(COST_REGEX, description)
  if not match:
    return None

  return parse_cost(match.group(1))


def find_time(description: str) -> Optional[str]:
  """Find a time from a description field."""
  match = re.search(TIME_REGEX, description, flags=re.IGNORECASE)
  if not match:
    return None

  return parse_12hr_time(match.group(1))


def parse_12hr_time(time_str: str) -> str:
  """Parse a time from 12 hour to 24 hour format."""
  time_no_space = time_str.lower().replace(" ", "")
  hour, info = time_no_space.split(":")
  minute, am_pm = info[:2], info[2:]
  hour = int(hour)
  minute = int(minute)
  if am_pm == "pm":
    hour += 12
  return f"{hour:02}:{minute:02}"
