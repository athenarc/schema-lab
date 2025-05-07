import { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownAZ,
  faArrowDownZA,
} from "@fortawesome/free-solid-svg-icons";
import FileUploadModal from "./FileUpload";

const timestampToDateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const ColumnSortIcon = ({ columnKey, sortKey, sortOrder }) => {
  const isActive = sortKey === columnKey;
  const isAsc = sortOrder === "asc";
  const icon = isActive && isAsc ? faArrowDownZA : faArrowDownAZ;
  return (
    <FontAwesomeIcon
      icon={icon}
      className={`ms-1 ${isActive ? "text-primary" : "text-muted"}`}
    />
  );
};

const FilesList = ({ files, userDetails, onUploadSuccess }) => {
  const [sortKey, setSortKey] = useState("path");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterName, setFilterName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredFiles = files.filter((file) =>
    file.path.toLowerCase().includes(filterName.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aValue =
      sortKey === "size"
        ? a.metadata?.size
        : sortKey === "ts_modified"
        ? a.metadata?.ts_modified
        : a[sortKey];
    const bValue =
      sortKey === "size"
        ? b.metadata?.size
        : sortKey === "ts_modified"
        ? b.metadata?.ts_modified
        : b[sortKey];

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Container fluid className="w-800">
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="fw-bold border-bottom pb-2 mb-2 d-none d-md-flex">
        <Col
          md={6}
          onClick={() => handleSort("path")}
          style={{ cursor: "pointer" }}
        >
          File Name{" "}
          <ColumnSortIcon
            columnKey="path"
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </Col>
        <Col
          md={1}
          onClick={() => handleSort("size")}
          style={{ cursor: "pointer" }}
        >
          Size{" "}
          <ColumnSortIcon
            columnKey="size"
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </Col>
        <Col
          md={3}
          onClick={() => handleSort("ts_modified")}
          style={{ cursor: "pointer" }}
        >
          Created At{" "}
          <ColumnSortIcon
            columnKey="ts_modified"
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </Col>
        <Col md={2}>Actions</Col>
      </Row>

      <div className="px-2" style={{ width: "100%", height: "530px", overflowY: "auto", overflowX: "hidden" }}>
        {sortedFiles.length === 0 && (
          <Row>
            <Col className="text-center">No files uploaded yet!</Col>
          </Row>
        )}
        {sortedFiles.map((file, index) => (
          <Row
            key={index}
            className="border rounded p-2 mb-3 mt-3 flex-column flex-md-row gx-3"
          >
            <Col xs={12} md={6} className="text-truncate">
              <div className="fw-bold d-md-none">File Name</div>
              {file?.path}
            </Col>
            <Col xs={12} md={1}>
              <div className="fw-bold d-md-none">Size</div>
              {formatBytes(file?.metadata?.size)}
            </Col>
            <Col xs={12} md={3}>
              <div className="fw-bold d-md-none">Created At</div>
              {new Date(file?.metadata?.ts_modified).toLocaleDateString(
                undefined,
                timestampToDateOptions
              )}
            </Col>
            <Col xs={12} md={2}>
              <div className="fw-bold d-md-none">Actions</div>
            </Col>
          </Row>
        ))}
      </div>

      <Row className="mt-3">
        <Col className="col-md-3 offset-md-9 text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Upload File
          </Button>
          <FileUploadModal
            show={showModal}
            onClose={() => setShowModal(false)}
            userDetails={userDetails?.apiKey}
            onUploadSuccess={onUploadSuccess}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default FilesList;
