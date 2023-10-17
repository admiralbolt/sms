"""Utils for parsing garbage data from the APIs."""

def parse_cost(cost: str) -> float:
  """Parse ticket cost field."""
  if cost.startswith("$"):
    cost = cost[1:]

  if not cost:
    return 0

  return float(cost)
