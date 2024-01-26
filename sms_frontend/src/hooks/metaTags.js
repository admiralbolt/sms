import { useEffect } from 'react';

const usePageTitle = (title) => {
  const defaultTitle = 'Seattle Music Scene';

  useEffect(() => {
    console.log(`TITLE = ${title}, default = ${defaultTitle}`);
    document.title = title || defaultTitle;
  }, [defaultTitle, title]);
}

const usePageDescription = (description) => {
  const defaultDescription = 'Seattle Open Mics & Shows';

  useEffect(() => {
    document.querySelector("meta[name='description']").setAttribute("content", description || defaultDescription);
  }, [defaultDescription, description]);
}

export { usePageTitle, usePageDescription };