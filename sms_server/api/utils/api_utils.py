"""Utils for interacting with / debugging APIs."""
from api.models import APISample

def create_samples(name: str, api_name: str, data: dict) -> None:
  APISample.objects.create(
    name=name,
    api_name=api_name,
    data=data
  )

  