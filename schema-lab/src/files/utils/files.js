// Returns the base filename from a path
export const getBaseFilename = (path) => {
  if (!path) return "";
  const parts = path?.split(/[/\\]/);
  return parts[parts?.length - 1];
};

// Checks if a file is previewable based on its extension
export const isPreviewableFile = (path) => {
  if (!path) return false;
  const ext = path?.split(".")?.pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "csv"].includes(ext);
};

// Checks if uploading a file would overwrite an existing file in the list
export const wouldOverwriteFile = ({ fileToUpload, existingFiles }) => {
  if (!fileToUpload) return false;
  const uploadName = getBaseFilename(fileToUpload?.name);
  return existingFiles?.some((f) => getBaseFilename(f?.path) === uploadName);
};
