import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Card,
  Form,
  InputGroup,
  Spinner,
  Row,
  Col,
  Container,
  Stack,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faRedo,
  faSearch,
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getFiles } from "../../api/v1/files";
import { formatBytes, timestampToDateOptions } from "../utils/utils";

export function FileCard({ file, isSelected, onToggle }) {
  return (
    <Card
      className={`position-relative p-2 border-0 shadow-sm rounded-3 ${
        isSelected ? "border-primary border-2" : "border-light"
      }`}
      style={{
        cursor: "pointer",
        backgroundColor: isSelected ? "#f0f7ff" : "white",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
      }}
      onClick={onToggle}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "rgb(119, 0, 212)",
            color: "white",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            boxShadow: "0 0 4px rgba(0,0,0,0.2)",
          }}
        >
          ✓
        </div>
      )}

      <Card.Header
        className="bg-light text-center fw-semibold text-truncate"
        title={file?.path?.split("/").pop()}
        style={{ fontSize: "0.9rem", maxWidth: "100%" }}
      >
        {file?.path?.split("/").pop()}
      </Card.Header>

      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
        <FontAwesomeIcon
          icon={faFolder}
          size="2x"
          className="mb-2"
          style={{
            color: isSelected ? "rgb(119, 0, 212)" : "#adb5bd",
            transition: "color 0.3s ease",
          }}
        />
        <div className="small text-muted">
          {formatBytes(file?.metadata?.size) || "-"}
        </div>
        <div className="" style={{ fontSize: "0.75rem" }}>
          {new Date(file?.metadata?.ts_modified).toLocaleDateString(
            "en",
            timestampToDateOptions
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export function FilesList({
  files,
  selectedFiles,
  toggleFile,
  setSelectedFiles,
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
      setSelectedFiles((prev) =>
        prev.filter((f) => !filteredFiles.some((file) => file.path === f.path))
      );
    } else {
      const newFiles = filteredFiles.filter(
        (file) => !selectedFiles.some((f) => f.path === file.path)
      );
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  return (
    <Container fluid className="p-2 mb-3 ">
      <Row className="align-items-center mb-3 pb-3 border-bottom">
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
        style={{ maxHeight: "200px" }}
      >
        {filteredFiles.map((file, index) => {
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

      {filteredFiles.length === 0 && (
        <div className="text-center text-muted mt-3">No files found.</div>
      )}
    </Container>
  );
}

export function Folders({
  files,
  selectedFiles,
  toggleFile,
  setSelectedFiles,
}) {
  const [selectedFolder, setSelectedFolder] = useState(null);

  const folders = Array.from(
    new Set(files.map((file) => file.path.split("/").slice(0, -1).join("/")))
  );

  useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0]);
    }
  }, [folders, selectedFolder]);

  const filesInSelectedFolder = files.filter(
    (file) => file.path.split("/").slice(0, -1).join("/") === selectedFolder
  );

  return (
    <Row>
      <Col md={4}>
        <Container fluid className="p-2 mb-3">
          <Row xs={1} className="g-3">
            {folders.map((folder, index) => (
              <Col key={index}>
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="align-items-center p-2 rounded border bg-light"
                  onClick={() => setSelectedFolder(folder)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      folder === selectedFolder ? "#e9ecef" : "white",
                    color:
                      folder === selectedFolder ? "rgb(119, 0, 212)" : "#000",
                  }}
                >
                  <FontAwesomeIcon icon={faFolder} />
                  <span>{folder}</span>
                </Stack>
              </Col>
            ))}
          </Row>
        </Container>
      </Col>

      <Col md={8}>
        <FilesList
          files={filesInSelectedFolder}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          toggleFile={toggleFile}
        />
      </Col>
    </Row>
  );
}

export function SelectedFilesPreview({ selectedFiles, handleResetFiles }) {
  return (
    <Stack direction="horizontal" className="p-2 w-100 justify-content-between">
      <div>
        <strong>{selectedFiles?.length}</strong> file(s) selected
      </div>
      <Button
        variant="primary"
        disabled={selectedFiles.length === 0}
        onClick={() => {
          handleResetFiles();
        }}
      >
        Reset
      </Button>
    </Stack>
  );
}

export default function FilePicker({ userDetails }) {
  // Component that displays folders and files from the user's project storage
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchFiles = useCallback(() => {
    setLoading(true);
    getFiles({ auth: userDetails.apiKey, recursive: "yes" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 500) {
            throw new Error("Internal Server Error (500)");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setFiles(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch files:", err.message);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userDetails.apiKey]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const toggleFile = (file) => {
    setSelectedFiles((prev) => {
      const alreadySelected = prev.some((f) => f.path === file.path);
      if (alreadySelected) {
        return prev.filter((f) => f.path !== file.path);
      }
      return [...prev, file];
    });
  };
  const handleResetFiles = () => {
    setSelectedFiles([]);
  };
  return (
    <Card className="border-0 shadow-sm rounded-3 mb-4">
      <Card.Header className="py-3">
        Pick Files
        <FontAwesomeIcon
          icon={faRedo}
          className="ms-2 text-primary"
          title="Refresh Files"
          style={{ cursor: "pointer" }}
          onClick={fetchFiles}
        />
      </Card.Header>

      <Card.Body className="p-2">
        {loading && (
          <div className="d-flex flex-column align-items-center m-3">
            <Spinner animation="border" role="status" variant="primary" />
            <div className="mt-2">Loading files...</div>
          </div>
        )}

        {!loading && files.length === 0 && (
          <Row>
            <Col className="text-center">
              {error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <div className="alert alert-warning">No files available!</div>
              )}
            </Col>
          </Row>
        )}

        {!loading && files.length > 0 && (
          <Folders
            files={files}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            toggleFile={toggleFile}
          />
        )}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between p-2">
        <SelectedFilesPreview
          selectedFiles={selectedFiles}
          handleResetFiles={handleResetFiles}
        />
      </Card.Footer>
    </Card>
  );
}
