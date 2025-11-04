import { useState, useMemo } from "react";
import { Form, InputGroup, Row, Col, Container, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";

import { FileCard } from "./FileCard";

export function FileGrid({
  files,
  selectedFiles,
  toggleFile,
  handleSetSelectedFiles,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    const lower = searchTerm.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(lower));
  }, [files, searchTerm]);

  const allSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((file) =>
      selectedFiles.some((f) => f?.path === file?.path)
    );

  const handleSelectAll = () => {
    if (allSelected) {
      handleSetSelectedFiles((prev) =>
        prev.filter((f) => !filteredFiles.some((file) => file.path === f.path))
      );
    } else {
      const newFiles = filteredFiles.filter(
        (file) => !selectedFiles.some((f) => f.path === file.path)
      );
      handleSetSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleClearSelection = () => {
    handleSetSelectedFiles([]);
  };

  return (
    <Container fluid className="p-2">
      <Row className="align-items-center pb-3 border-bottom">
        <Col xs={12} md={6} className="mb-2 mb-md-0">
          <InputGroup>
            <InputGroup.Text className="bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-flex justify-content-md-end gap-2 flex-wrap"
        >
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
        </Col>
      </Row>

      <Row
        xs={1}
        sm={2}
        md={3}
        lg={4}
        className="py-2 g-3 overflow-y-auto"
        style={{ maxHeight: "300px" }}
      >
        {filteredFiles?.map((file, index) => {
          const isSelected = selectedFiles.some((f) => f?.path === file?.path);
          return (
            <Col key={index}>
              <FileCard
                file={file}
                isSelected={isSelected}
                onToggle={() => toggleFile(file)}
              />
            </Col>
          );
        })}
      </Row>

      {filteredFiles?.length === 0 && (
        <div className="text-center text-muted mt-3">
          This folder has no files.
        </div>
      )}
    </Container>
  );
}
