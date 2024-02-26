import { useEffect } from "react";

const usePageTitle = (title: string) => {
  const defaultTitle = "Seattle Music Scene";

  useEffect(() => {
    document.title = title || defaultTitle;
  }, [defaultTitle, title]);
};

const usePageDescription = (description: string) => {
  const defaultDescription = "Seattle Open Mics & Shows";

  useEffect(() => {
    document
      ?.querySelector("meta[name='description']")
      ?.setAttribute("content", description || defaultDescription);
  }, [defaultDescription, description]);
};

export { usePageTitle, usePageDescription };
