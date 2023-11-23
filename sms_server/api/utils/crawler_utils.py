"""Utilities for crawling things!"""
from selenium import webdriver

import bs4
import undetected_chromedriver

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"

def create_chrome_driver():
  """Create a headless chrome driver for requests."""
  options = undetected_chromedriver.ChromeOptions()
  options.add_argument("--headless")
  # options.add_argument("--enable-javascript")
  options.add_argument(f"--user-agent={USER_AGENT}")
  return undetected_chromedriver.Chrome(options=options)

def get_html_soup(driver: webdriver.Chrome, url: str) -> bs4.BeautifulSoup:
  """Delicious soup."""
  driver.get(url)
  return bs4.BeautifulSoup(driver.page_source, "html.parser")
