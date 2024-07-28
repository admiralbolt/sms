from django.test import TestCase

from api.utils import search_utils

class ScoringTestCase(TestCase):

  def debug_score(self, name: str, keyword: str):
    print(f"Scoring {name=}, {keyword=}: {search_utils.score(name, keyword)}.\nRaw Scores:\n{search_utils.get_raw_scores(name, keyword)}\n")
  
  def test_exact_match_is_100(self):
    self.assertEqual(100, search_utils.score("SOME EVENT TITLE", keyword="some event title"))

  def test_no_match_is_0(self):
    self.assertEqual(0, search_utils.score("QUICK FOX", keyword="lazy"))

  def test_one_char_swap_is_still_high(self):
    self.assertGreaterEqual(search_utils.score("venting", keyword="ventign"), 85)

  def test_one_letter_missing_is_still_high(self):
    self.assertGreaterEqual(search_utils.score("abcdefghij", keyword="abcdefghi"), 85)

  def test_misc_cases(self):
    self.assertLessEqual(search_utils.score("Marble", keyword="carl"), search_utils._SCORE_THRESHOLD)
    self.assertGreaterEqual(search_utils.score("Darci Carlson", keyword="carl"), search_utils._SCORE_THRESHOLD)

  def test_check_raw_scores(self):
    self.debug_score("Darci Carlson", keyword="carl")
    self.debug_score("Carl Christensen & The Lake Flora Band", keyword="carl")
