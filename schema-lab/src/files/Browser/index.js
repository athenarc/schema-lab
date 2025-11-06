import FileBrowserCard from "./FileBrowserCard";

export default function FileBrowser({
  userDetails,
  selectedFiles,
  handleSetSelectedFiles,
}) {
  return (
    <FileBrowserCard
      userDetails={null}
      selectedFiles={selectedFiles}
      handleSetSelectedFiles={handleSetSelectedFiles}
    />
  );
}
