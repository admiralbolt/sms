const DEFAULT_PAGE_TITLE = "Seattle Music Scene";
const DEFAULT_PAGE_DESCRIPTION = "Seattle Open Mics & Shows";

interface MetaInfo {
  title?: string;
  description?: string;
}

export const setMeta = (data: MetaInfo) => {
  document.title = data?.title || DEFAULT_PAGE_TITLE;
  document
      ?.querySelector("meta[name='description']")
      ?.setAttribute("content", data?.description || DEFAULT_PAGE_DESCRIPTION);
}