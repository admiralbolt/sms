import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FilterPanel from '../../components/FilterPanel/FilterPanel';

const AboutView = () => {
  return (
    <>
    <FilterPanel />
    <Box sx={{ padding: 1.5 }}>
      <Typography>
        All<sup style={{ fontSize: "6px" }}>(most)</sup> Seattle shows & open mics in one place!
      </Typography>
      <br />
      <Typography>
        This app is a mix of aggregating information from event apis, crawling
        venue websites, and manual event generation for open mics. Things might
        not be 100% accurate, as this is still a work in progress.
      </Typography>
    </Box>
    </>
  );
}

export default AboutView;