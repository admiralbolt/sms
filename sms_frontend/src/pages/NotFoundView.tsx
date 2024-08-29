import { Box, Typography } from "@mui/material";

import { setMeta } from "@/utils/seo";

export const NotFoundView = () => {
  setMeta({
    title: "Seattle Music Scene 404",
    description: "Seattle Music Scene 404",
  });

  return (
    <>
      <Box sx={{ padding: 1.5, maxWidth: "md" }}>
        <Typography variant={"h4"}>404 Not Found!</Typography>
        <br />
        <Typography sx={{ fontSize: "1.1rem" }}>
          Use one of the links above to get you back where you need to be!
        </Typography>
      </Box>
    </>
  );
};
