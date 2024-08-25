from api.constants import get_all, IngestionApis
from api.ingestion.crawlers import blue_moon, darrells_tavern, little_red_hen, sea_monster_lounge, skylark, the_royal_room
from api.ingestion.crawlers.crawler import AbstractCrawler
from api.ingestion.event_apis import axs, bandsintown, dice, eventbrite, songkick, ticketmaster, tixr, venuepilot
from api.ingestion.event_apis.event_api import EventApi

EVENT_API_MAPPING: dict[str, EventApi] = {
  IngestionApis.AXS: axs.AXSApi(),
  IngestionApis.BANDSINTOWN: bandsintown.BandsintownApi(),
  IngestionApis.DICE: dice.DiceApi(),
  IngestionApis.EVENTBRITE: eventbrite.EventbriteApi(),
  IngestionApis.SONGKICK: songkick.SongkickApi(),
  IngestionApis.TICKETMASTER: ticketmaster.TicketmasterApi(),
  IngestionApis.TIXR: tixr.TIXRApi(),
  IngestionApis.VENUEPILOT: venuepilot.VenuepilotApi()
}

CRAWLER_MAPPING: dict[str, AbstractCrawler] = {
  IngestionApis.CRAWLER_BLUE_MOON: blue_moon.BlueMoonCrawler(),
  IngestionApis.CRAWLER_DARRELLS_TAVERN: darrells_tavern.DarellsTavernCrawler(),
  IngestionApis.CRAWLER_LITTLE_RED_HEN: little_red_hen.LittleRedHenCrawler(),
  IngestionApis.CRAWLER_SEA_MONSTER_LOUNGE: sea_monster_lounge.SeaMonsterLoungeCrawler(),
  IngestionApis.CRAWLER_SKYLARK: skylark.SkylarkCrawler(),
  IngestionApis.CRAWLER_THE_ROYAL_ROOM: the_royal_room.TheRoyalRoomCrawler()
}

API_MAPPING = EVENT_API_MAPPING | CRAWLER_MAPPING

CRAWLER_NICE_NAMES: dict[str, str] = {
  "blue_moon": IngestionApis.CRAWLER_BLUE_MOON,
  "darrells_tavern": IngestionApis.CRAWLER_DARRELLS_TAVERN,
  "little_red_hen": IngestionApis.CRAWLER_LITTLE_RED_HEN,
  "sea_monster_lounge": IngestionApis.CRAWLER_SEA_MONSTER_LOUNGE,
  "skylark": IngestionApis.CRAWLER_SKYLARK,
  "the_royal_room": IngestionApis.CRAWLER_THE_ROYAL_ROOM
}

API_PRIORITY_LIST = [
  IngestionApis.MANUAL,
  IngestionApis.DICE,
  IngestionApis.AXS,
  IngestionApis.TIXR,
  IngestionApis.VENUEPILOT,
  # Solid data, but generally aggregators of existing sources.
  IngestionApis.SONGKICK,
  IngestionApis.BANDSINTOWN,
  # Put all the manual crawlers at the bottom, because I hate them.
  IngestionApis.CRAWLER_BLUE_MOON,
  IngestionApis.CRAWLER_DARRELLS_TAVERN,
  IngestionApis.CRAWLER_LITTLE_RED_HEN,
  IngestionApis.CRAWLER_SEA_MONSTER_LOUNGE,
  IngestionApis.CRAWLER_SKYLARK,
  IngestionApis.CRAWLER_THE_ROYAL_ROOM,
  # Data can be suspect at best.
  IngestionApis.EVENTBRITE,
  IngestionApis.TICKETMASTER,
]

def get_api_priority(api: str) -> int:
  try:
    return API_PRIORITY_LIST.index(api)
  except:
    return 100