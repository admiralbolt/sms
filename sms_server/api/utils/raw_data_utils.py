from typing import Optional

import deepdiff

from api.constants import ChangeTypes
from api.models import RawData


def get_raw_data(api_name: str, event_api_id: str) -> Optional[RawData]:
  return RawData.objects.filter(api_name=api_name, event_api_id=event_api_id).first()


def create_or_update_raw_data(**kwargs) -> tuple[str, str, RawData]:
  """Create or update raw data.

  Returns a tuple of (change_type, change_log, RawData).
  """
  allowed_keys = set([field.name for field in RawData._meta.get_fields()])
  filtered_kwargs = {key: kwargs[key] for key in kwargs if key in allowed_keys}
  raw_data = get_raw_data(api_name=kwargs["api_name"], event_api_id=kwargs["event_api_id"])
  if not raw_data:
    # If raw data doesn't exist, create it and return.
    raw_data = RawData.objects.create(**filtered_kwargs)
    return ChangeTypes.CREATE, "", raw_data

  # If it does exist, we do some complicated diffing / updating.
  old_data = raw_data.data
  new_data = kwargs["data"]

  diff = deepdiff.DeepDiff(
    old_data,
    new_data,
    ignore_order=True,
    exclude_paths=["impression_id"],
  )

  if not diff:
    return ChangeTypes.NOOP, "", raw_data

  # If there is a diff, we just take the updated version. We use the actual
  # diff as the change_log.
  raw_data.data = new_data
  raw_data.save()

  return ChangeTypes.UPDATE, diff.to_json(), raw_data
