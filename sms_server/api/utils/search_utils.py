"""All search related functions."""
import datetime

from collections import Counter
from fuzzywuzzy import fuzz

from api import models

# Weights of corresponding fuzzy matching components.
_PARTIAL_RATIO_WEIGHT = 0.6
_TOKEN_RATIO_WEIGHT = 1
_JACCARD_WEIGHT = 0.5

# Weights of event name match vs venue name match.
_EVENT_NAME_WEIGHT = 0.6
_EVENT_VENUE_WEIGHT = 0.4

_SCORE_THRESHOLD = 50

def jaccard(a: str, b: str) -> float:
  """Get the jaccard similarity of two strings.

  In this case we use counters to better count multiple occurences of characters
  in a string.
  """
  a_count = Counter(a)
  b_count = Counter(b)
  return float(sum((a_count & b_count).values())) / sum((a_count | b_count).values())

def score(name: str, keyword: str) -> float:
  """Compute a matching score for a string.

  The score is computed as a weighted sum of 3 metrics:
    1. Fuzzywuzzy Partial Ratio.
    2. Fuzzywuzzy Token Ratio.
    3. Jaccard Similarity.
  """
  name_lower = name.lower()
  keyword_lower = keyword.lower()
  # Partial ratio allows for minor difference in words as long as substrings match.
  # Score is a range from 0-100.
  partial_ratio = fuzz.partial_ratio(name_lower, keyword_lower)
  # Token ratio allows for ordering differences in words as long as they are exact matches.
  # Score is a range from 0-100.
  token_ratio = fuzz.token_set_ratio(name_lower, keyword_lower)
  # Rescale jaccard to 0-100
  jc_score = jaccard(name_lower, keyword_lower) * 100

  return (
    partial_ratio * _PARTIAL_RATIO_WEIGHT +
    token_ratio * _TOKEN_RATIO_WEIGHT +
    jc_score * _JACCARD_WEIGHT
  ) / sum([_PARTIAL_RATIO_WEIGHT, _TOKEN_RATIO_WEIGHT, _JACCARD_WEIGHT])

def score_event(event: models.Event, keyword: str) -> float:
  """Compute a matching score for an event."""
  return score(event.title, keyword) * _EVENT_NAME_WEIGHT + score(event.venue.name, keyword) * _EVENT_VENUE_WEIGHT

def search_all_events(keyword: str):
  """Search all events!"""
  all_events = models.Event.objects.order_by("title").filter(event_day__gte=datetime.date.today(), show_event=True)
  scores = map(lambda event: score_event(event, keyword), all_events)
  return [event for score, event in sorted(zip(scores, all_events), key=lambda pair: pair[0], reverse=True) if score > _SCORE_THRESHOLD]