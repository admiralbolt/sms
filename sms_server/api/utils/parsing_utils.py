"""Utils for parsing garbage data from the APIs."""
import re
from typing import Optional

COST_REGEX = "\$([0-9]+(\.[0-9]+)?)"
NO_COVER_REGEX = "(no cover)"

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
