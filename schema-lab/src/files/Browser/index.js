import { useEffect, useState } from "react";
import FileBrowserCard from "./FileBrowserCard";

export default function FileBrowser({ selectedFiles, handleSetSelectedFiles }) {
  const isControlled = selectedFiles !== undefined && selectedFiles !== null;

  const [selectedFilesLocal, setSelectedFilesLocal] = useState([]);

  // Sync local state if controlled value changes
  useEffect(() => {
    if (isControlled) {
      setSelectedFilesLocal(selectedFiles);
    }
  }, [selectedFiles, isControlled]);

  const onSelectedFilesChange = (files) => {
    if (isControlled) {
      handleSetSelectedFiles(files);
    } else {
      setSelectedFilesLocal(files);
    }
  };

  return (
    <FileBrowserCard
      selectedFiles={isControlled ? selectedFiles : selectedFilesLocal}
      handleSetSelectedFiles={onSelectedFilesChange}
    />
  );
}
