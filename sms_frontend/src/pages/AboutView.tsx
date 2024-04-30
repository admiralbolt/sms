import { Divider, Link, List, ListItem, Typography } from "@mui/material";
import { Box, Grid } from "@mui/material";

import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

export const AboutView = () => {
  usePageTitle("Seattle Music Scene - About");
  usePageDescription("Information about the seattle music scene website");

  return (
    <Box
      sx={{
        padding: 1.5,
        maxWidth: "md",
        overflowY: "scroll",
        height: "100vh",
        paddingBottom: "10vh",
      }}
    >
      <Typography variant={"h4"}>
        All<sup style={{ fontSize: "6px" }}>(most)</sup> Seattle shows & open
        mics in one place!
      </Typography>
      <br />
      <Typography sx={{ fontSize: "1.1rem" }}>
        This app aggregates data from a number of places, including event apis,
        crawling venue websites, and manual event generation for open mics. As a
        result things might not be 100% accurate! Please double check info with
        the venue itself!
      </Typography>
      <br />
      <Typography sx={{ fontSize: "1.1rem" }}>
        If you notice any information is incorrect, venues are missing, or have
        bug reports / feature requests, please reach out to me via{" "}
        <Link href="mailto:aviknecht@gmail.com">aviknecht@gmail.com</Link> OR
        message me on instagram{" "}
        <Link href="https://instagram.com/wanderingbluemusic">
          @wanderingbluemusic
        </Link>
        .
      </Typography>
      <Divider sx={{ marginTop: "1.5rem", marginBottom: "1.5rem" }} />
      <Typography variant={"h5"}>Changelog</Typography>
      <br />
      <Typography sx={{ fontSize: "1.3rem" }}>
        <b>V1.2.0</b> -- Apr 1st, 2024 <br />
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Frontend rewrite! Now sporting vite.js and tailwind!
        </ListItem>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Fixed a couple bugs with the data ingester, and added stats tracking
          for runs of the ingester. The couple bugs are things like:
          <ListItem
            sx={{
              display: "list-item",
              paddingBottom: 0,
              paddingTop: 0,
            }}
          >
            One failed import would break the entire ingester.
          </ListItem>
          <ListItem
            sx={{
              display: "list-item",
              paddingBottom: 0,
              paddingTop: 0,
            }}
          >
            Venues that have very similar latitude / longitude breaking the
            ingester.
          </ListItem>
          <ListItem
            sx={{
              display: "list-item",
              paddingBottom: 0,
              paddingTop: 0,
            }}
          >
            Venues that have the same name but different latitude / longitude
            breaking the ingester.
          </ListItem>
        </ListItem>
      </List>
      Open Mic/Jam Adjustments <br />
      <Grid container borderTop={"1px solid white"} padding={0.5}>
        <Grid item xs={6} md={3} paddingTop={0}>
          + Sea Monster <br />
          + Supernova <br />
          + Cottontail <br />
          + Rabbit Box <br />
        </Grid>
        <Grid item xs={6} md={3} paddingTop={0}>
          - Last Call <br />
          - Lottie's <br />
          - Conor Byrne <br />
        </Grid>
      </Grid>
      <br />
      <br />
      <Typography sx={{ fontSize: "1.3rem" }}>
        <b>V1.1.0</b> -- Mar 1st, 2024 <br />
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Integration with dice.fm added! This adds shows for these venues:
          Sunset Tavern, Rabbit Box, Kremwerk, Belltown Yacht Club, Vera
          Project, Black Lodge
        </ListItem>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Added open mics for Outlander, Peace of Mind, C&P Coffee, and
          Boneyard!
        </ListItem>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Fixed a bug where some non music events (like trivia) were incorrectly
          showing up.
        </ListItem>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Updating listing page to sort by venue.
        </ListItem>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Added icons to distinguish between shows & open mics.
        </ListItem>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Fixed the event detail cards to have consistent sizes.
        </ListItem>
      </List>
      <br />
      <Typography sx={{ fontSize: "1.3rem" }}>
        <b>V1.0.0</b> -- January 26th, 2024 <br />
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem
          sx={{
            display: "list-item",
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          Launched initial site!
        </ListItem>
      </List>
    </Box>
  );
};
