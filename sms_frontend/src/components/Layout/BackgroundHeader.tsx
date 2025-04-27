import { Box } from "@mui/material";

import { useAppBarHeight } from "@/hooks/materialHacks";
import theme from "@/hooks/theme";

interface Props {
  imageUrl?: string;
}

export const BackgroundHeader = ({ imageUrl }: Props) => {
  const appBarHeight = useAppBarHeight();

  if (imageUrl != null && imageUrl != "") {
    return (
      <Box
        sx={{
          filter: "brightness(20%);",
          position: "fixed",
          top: 0,
          zIndex: 9000,
          width: "100vw",
          height: "100vh",
        }}
      >
        <img
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0)",
            objectFit: "cover",
            width: "100vw",
          }}
          src={imageUrl}
        />
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          zIndex: 9100,
          width: "100vw",
          height: `${appBarHeight}px`,
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
        }}
      ></Box>
    );
  }
};
