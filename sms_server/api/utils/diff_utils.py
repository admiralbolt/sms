"""Utils related to diffing!"""

from typing import Optional

import deepdiff


def apply_diff(obj: object, values_changed: dict, fields: Optional[list[str]] = None) -> tuple[bool, object]:
  """Apply a diff to an event based on the provided fields.

  If fields is left empty, all are applied.
  """
  if not values_changed:
    return False, obj

  changed = False
  fields = [f"root['{field}']" for field in fields] or values_changed.keys()
  for field in fields:
    if field not in values_changed:
      continue

    proper_field_name = field.split("'")[1]
    setattr(obj, proper_field_name, values_changed[field]["new_value"])
    changed = True
  return changed, obj


def handle_new_fields_diff(obj: object, values_changed: dict) -> object:
  """If new fields are added, add them!

  This time if they are "changed" i.e. we go from an empty to field to one that
  has stuff in it.
  """
  if not values_changed:
    return False, obj

  changed = False
  fields_to_change = []
  for field_with_root, info in values_changed.items():
    if info["old_value"] or not info["new_value"]:
      continue

    fields_to_change.append(field_with_root.split("'")[1])

  if fields_to_change:
    changed, _ = apply_diff(obj, values_changed, fields=fields_to_change)

  return changed, obj


def handle_new_fields(obj: object, new_event_data: dict, diff: deepdiff.DeepDiff) -> tuple[bool, object]:
  """If new fields are added, add them!"""
  changed = False
  fields_added = diff.get("dictionary_item_added", [])
  if fields_added:
    changed = True
    for field_with_root in fields_added:
      field = field_with_root.split("'")[1]
      setattr(obj, field, new_event_data[field])

  type_changes = diff.get("type_changes", {})
  for field_with_root, change_dict in type_changes.items():
    if change_dict["old_type"] != type(None) or not change_dict["new_value"]:
      continue

    changed = True
    field = field_with_root.split("'")[1]
    setattr(obj, field, change_dict["new_value"])

  return changed, obj
