def parse_cost(cost: str) -> float:
  if cost.startswith("$"):
    cost = cost[1:]

  if not cost:
    return 0

  return float(cost)