import { useState, useMemo, useEffect } from "react";
import { Container } from "react-bootstrap";

import { FileCard } from "./FileCard";
import LoadingComponent from "../utils/LoadingComponent";
import { FileListControls } from "./FileListControls";
import { useDebounce } from "../utils/hooks";

export function FileGrid({
  files,
  selectedFiles,
  handleToggleFile,
  handleSetSelectedFiles,
  handleRefreshFiles,
  mode,
  userDetails,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredFiles = useMemo(() => {
    if (!debouncedSearchTerm) return files;
    const lower = debouncedSearchTerm?.toLowerCase();
    return files?.filter((f) => f?.path?.toLowerCase()?.includes(lower));
  }, [files, debouncedSearchTerm]);

  useEffect(() => {
    if (searchTerm) setSearchLoading(true);
  }, [searchTerm]);

  useEffect(() => {
    setSearchLoading(false);
  }, [debouncedSearchTerm]);

  const allSelected =
    filteredFiles?.length > 0 &&
    filteredFiles?.every((file) =>
      selectedFiles?.some((f) => f?.path === file?.path)
    );

  const handleSelectAll = () => {
    if (allSelected) {
      handleSetSelectedFiles((prev) =>
        prev?.filter(
          (f) => !filteredFiles?.some((file) => file?.path === f?.path)
        )
      );
    } else {
      const newFiles = filteredFiles?.filter(
        (file) => !selectedFiles?.some((f) => f.path === file.path)
      );
      handleSetSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleClearSelection = () => {
    handleSetSelectedFiles((prev) =>
      prev?.filter(
        (f) => !filteredFiles?.some((file) => file?.path === f?.path)
      )
    );
  };

  return (
    <Container fluid className="p-2 h-100 d-flex flex-column">
      <FileListControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        allSelected={allSelected}
        handleSelectAll={handleSelectAll}
        handleClearSelection={handleClearSelection}
        mode={mode}
        userDetails={userDetails}
        handleRefreshFiles={handleRefreshFiles}
        files={files}
      />
      <div
        className="overflow-y-auto p-2 flex-grow-0"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          maxHeight: "42vh",
        }}
      >
        {!searchLoading && filteredFiles?.length > 0
          ? filteredFiles?.map((file) => (
              <FileCard
                key={file?.path}
                file={file}
                isSelected={selectedFiles?.some((f) => f?.path === file?.path)}
                onToggle={() => handleToggleFile(file)}
                handleRefreshFiles={handleRefreshFiles}
                mode={mode}
              />
            ))
          : !searchLoading && (
              <div
                className="text-center text-muted mt-3"
                style={{ gridColumn: "1 / -1" }}
              >
                {debouncedSearchTerm
                  ? `No results found for "${debouncedSearchTerm}"`
                  : "This folder has no files."}
              </div>
            )}
      </div>
      {searchLoading && (
        <div
          className="overflow-y-auto p-2 flex-grow-1 d-flex justify-content-center align-items-center"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          <LoadingComponent message="Searching files..." />
        </div>
      )}
    </Container>
  );
}
