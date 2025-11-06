import { useEffect, useState } from "react";
import FileBrowserCard from "./FileBrowserCard";

export default function FileBrowser({ selectedFiles, handleSetSelectedFiles }) {
  // Component that displays folders and files from the user's project storage
  //
  // This component can be used in a controlled manner by providing
  // `selectedFiles` and `handleSetSelectedFiles` props.
  // If these props are not provided, it will manage its own state internally.

  // Determine if the component is controlled or uncontrolled
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
