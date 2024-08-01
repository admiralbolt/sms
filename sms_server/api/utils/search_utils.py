"""All search related functions."""
import dataclasses
import datetime

from collections import Counter
from fuzzywuzzy import fuzz

from api import models

# Weights of corresponding fuzzy matching components.
_PARTIAL_RATIO_WEIGHT = 1
_TOKEN_RATIO_WEIGHT = 1
_JACCARD_WEIGHT = 0.5

_SUBSTRING_WEIGHT = 20
_SCORE_THRESHOLD = 65

_MAX_SCORE = 100
_MIN_SCORE = 0

@dataclasses.dataclass
class ScoringResult:
  is_substring: bool
  length_offset: int
  length_ratio: float
  partial_ratio: float
  token_ratio: float
  jaccard: float

  def __str__(self):
    return f"  {self.is_substring=}\n  {self.length_offset=}\n  {self.length_ratio=}\n  {self.partial_ratio=}\n  {self.token_ratio=}\n  {self.jaccard=}"

def jaccard(a: str, b: str) -> float:
  """Get the jaccard similarity of two strings.

  In this case we use counters to better count multiple occurences of characters
  in a string.
  """
  a_count = Counter(a)
  b_count = Counter(b)
  return float(sum((a_count & b_count).values())) / sum((a_count | b_count).values())

def get_raw_scores(name: str, keyword: str) -> ScoringResult:
  """Compute raw values to be used for string comparison.

  1. Partial Ratio = (keyword chars in name) / len(keyword chars). 0-100 scale.
  2. 
  """
  name_lower = name.lower()
  keyword_lower = keyword.lower()

  name_len = len(name_lower)
  keyword_len = len(keyword_lower)

  return ScoringResult(
    is_substring=(keyword_lower in name_lower),
    length_offset=name_len - keyword_len,
    length_ratio=max(keyword_len, name_len) / (min(name_len, keyword_len) or 1),
    partial_ratio=fuzz.partial_ratio(name_lower, keyword_lower),
    token_ratio=fuzz.token_set_ratio(name_lower, keyword_lower),
    jaccard=jaccard(name_lower, keyword_lower) * 100
  )

def score(name: str, keyword: str) -> float:
  """Compute a matching score for a string.

  Returns a value from 0-100.

  The score is computed as a weighted sum of 3 metrics:
    1. Fuzzywuzzy Partial Ratio.
    2. Fuzzywuzzy Token Ratio.
    3. Jaccard Similarity.
  """
  scoring_result = get_raw_scores(name, keyword)

  weighted_score = (
    scoring_result.partial_ratio * _PARTIAL_RATIO_WEIGHT +
    scoring_result.token_ratio * _TOKEN_RATIO_WEIGHT +
    scoring_result.jaccard * _JACCARD_WEIGHT
  ) / sum([_PARTIAL_RATIO_WEIGHT, _TOKEN_RATIO_WEIGHT, _JACCARD_WEIGHT])


  
  if scoring_result.is_substring:
    weighted_score += _SUBSTRING_WEIGHT

  return min(_MAX_SCORE, max(weighted_score, _MIN_SCORE))

def search_all_events(keyword: str, include_hidden: bool=False):
  """Search all events!"""
  all_events = models.Event.objects.order_by("title").filter(event_day__gte=datetime.date.today())
  if not include_hidden:
    all_events = all_events.filter(show_event=True)
  scores = map(lambda event: score(event.title, keyword), all_events)
  return [event for score, event in sorted(zip(scores, all_events), key=lambda pair: pair[0], reverse=True) if score > _SCORE_THRESHOLD]

def search_all_venues(keyword: str, include_hidden: bool=False):
  """Search all venues!"""
  all_venues = models.Venue.objects.order_by("name").filter(name_lower__contains=keyword.lower())
  if not include_hidden:
    all_venues = all_venues.filter(show_venue=True)
  return all_venues

def search_all_artists(keyword: str):
  """Search all artists!"""
  all_artists = models.Artist.objects.order_by("name")
  scores = map(lambda artist: score(artist.name, keyword), all_artists)
  return [artist for score, artist in sorted(zip(scores, all_artists), key=lambda pair: pair[0], reverse=True) if score > _SCORE_THRESHOLD]

