import { useState, useMemo, useEffect } from "react";
import { Form, InputGroup, Container, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";

import { FileCard } from "./FileCard";
import { useDebounce } from "../utils/utils";
import LoadingComponent from "../utils/LoadingComponent";

export function FileGrid({
  files,
  selectedFiles,
  toggleFile,
  handleSetSelectedFiles,
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
        prev?.filter((f) => !filteredFiles?.some((file) => file?.path === f?.path))
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
      prev?.filter((f) => !filteredFiles?.some((file) => file?.path === f?.path))
    );
  };

  return (
    <Container fluid className="p-2 h-100 d-flex flex-column">
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-3 gap-2 border-bottom pb-3">
        <div className="flex-grow-1 me-md-2" style={{ minWidth: 0 }}>
          <InputGroup>
            <InputGroup.Text className="bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search files in the folder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />
          </InputGroup>
        </div>

        <div className="d-flex gap-2 mt-2 mt-md-0 flex-shrink-0">
          <Button
            variant={allSelected ? "outline-secondary" : "outline-primary"}
            onClick={handleSelectAll}
          >
            <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
          <Button variant="outline-danger" onClick={handleClearSelection}>
            <FontAwesomeIcon icon={faSquareXmark} className="me-1" />
            Clear
          </Button>
        </div>
      </div>

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
                onToggle={() => toggleFile(file)}
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
