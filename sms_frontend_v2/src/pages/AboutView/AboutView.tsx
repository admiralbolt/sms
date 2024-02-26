import { Divider, Link, List, ListItem, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { usePageTitle, usePageDescription } from "../../hooks/metaTags";

const AboutView = () => {
  usePageTitle("Seattle Music Scene - About");
  usePageDescription("Information about the seattle music scene website");

  return (
    <>
      <Box sx={{ padding: 1.5, maxWidth: "md" }}>
        <Typography variant={"h4"}>
          All<sup style={{ fontSize: "6px" }}>(most)</sup> Seattle shows & open
          mics in one place!
        </Typography>
        <br />
        <Typography sx={{ fontSize: "1.1rem" }}>
          This app aggregates data from a number of places, including event
          apis, crawling venue websites, and manual event generation for open
          mics. As a result things might not be 100% accurate! Please double
          check info with the venue itself!
        </Typography>
        <br />
        <Typography sx={{ fontSize: "1.1rem" }}>
          If you notice any information is incorrect, venues are missing, or
          have bug reports / feature requests, please reach out to me via{" "}
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
          <b>V1.0.0</b> -- January 26th, 2024 <br />
        </Typography>
        <List sx={{ listStyleType: "disc", pl: 4 }}>
          <ListItem sx={{ display: "list-item" }}>
            Launched initial site!
          </ListItem>
        </List>
      </Box>
    </>
  );
};

export default AboutView;
