import { Link, Typography } from '@mui/material';
import Box from '@mui/material/Box';

import { useEffect } from 'react';

const AboutView = () => {
  useEffect(() => {
    document.title = "Seattle Music Scene - About"
  });

  return (
    <>
    <Box sx={{ padding: 1.5, maxWidth: 'md' }}>
      <Typography variant={"h4"}>
        All<sup style={{ fontSize: "6px" }}>(most)</sup> Seattle shows & open mics in one place!
      </Typography>
      <br />
      <Typography sx={{ fontSize: "1.1rem" }}>
        This app aggregates data from a number of places, including event apis,
        crawling venue websites, and manual event generation for open mics.
        As a result things might not be 100% accurate! Please double check info
        with the venue itself!
      </Typography>
      <br />
      <Typography sx={{ fontSize: "1.1rem"}}>
        If you notice any information is incorrect, venues are missing, or have
        bug reports / feature requests, please reach out to me via <Link href="mailto:aviknecht@gmail.com">aviknecht@gmail.com</Link> OR
        message me on instagram <Link href="https://instagram.com/wanderingbluemusic">@wanderingbluemusic</Link>.
      </Typography>
    </Box>
    </>
  );
}

export default AboutView;