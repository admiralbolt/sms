"""BandsInTown Notes!!!

Upcoming events can be found here:
https://www.bandsintown.com/all-dates/fetch-next/upcomingEvents?page=2&longitude=-122.3701&latitude=47.6674

Can get the event url from this response => under the key "eventUrl", e.g.:

https://www.bandsintown.com/e/1032001879-black-nite-crash-at-the-vera-project?came_from=257&utm_medium=web&utm_source=home&utm_campaign=event

The event landing page has all the information about the event dumped into json
(which seems to be a pretty common practice).

There's a <script type="application/ld+json">{...}</script> at the bottom that
contains "@type": "MusicEvent", with all the relevant, easily parsable details
in it!
"""