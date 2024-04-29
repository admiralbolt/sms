// Thank you https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs!
import { useEffect, useState } from 'react';

const MOBILE_THRESHOLD = 800;

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    setIsMobile(width <= MOBILE_THRESHOLD);
  }, [width]);

  return isMobile;
};

export { useWindowDimensions, useIsMobile };
