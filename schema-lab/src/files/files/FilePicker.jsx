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
  Collapse,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faRedo,
  faSearch,
  faCheckSquare,
  faSquareXmark,
  faCaretDown,
  faCaretRight,
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
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = isSelected
          ? "#f0f7ff"
          : "white")
      }
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

export function FolderTree({
  folderName,
  folderData,
  level = 0,
  onSelectFolder,
  selectedFolder,
}) {
  const isRoot = level === 0;
  const [expanded, setExpanded] = useState(isRoot);
  const hasSubfolders = Object.keys(folderData).some(
    (k) =>
      k !== "files" && k !== "totalFiles" && typeof folderData[k] === "object"
  );
  return (
    <div style={{ marginLeft: level * 16 }}>
      <Stack
        direction="horizontal"
        gap={2}
        className="align-items-center p-2 rounded border bg-light mb-1"
        style={{
          cursor: "pointer",
          backgroundColor: folderName === selectedFolder ? "#e9ecef" : "white",
          color: folderName === selectedFolder ? "rgb(119, 0, 212)" : "#000",
        }}
        onClick={() => {
          onSelectFolder(folderName);
          if (!isRoot) setExpanded((prev) => !prev);
        }}
      >
        {hasSubfolders && !isRoot && (
          <FontAwesomeIcon
            icon={expanded ? faCaretDown : faCaretRight}
            style={{ width: "1rem" }}
          />
        )}

        <FontAwesomeIcon icon={faFolder} />
        <span>{folderName}</span>
        <span className="ms-auto text-muted small">
          ({folderData?.totalFiles || folderData.files?.length || 0})
        </span>
      </Stack>

      <Collapse in={expanded || isRoot}>
        <div>
          {Object.entries(folderData).map(([sub, data]) => {
            if (sub === "files" || sub === "totalFiles") return null;
            return (
              <FolderTree
                key={sub}
                folderName={sub}
                folderData={data}
                level={level + 1}
                onSelectFolder={onSelectFolder}
                selectedFolder={selectedFolder}
              />
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}

export function FolderBrowser({
  foldersMap = {},
  selectedFiles,
  toggleFile,
  handleSetSelectedFiles,
}) {
  const [selectedFolder, setSelectedFolder] = useState("/");

  const selectedFolderData = useMemo(() => {
    return selectedFolder === "/"
      ? foldersMap["/"]
      : findNestedFolder(foldersMap, selectedFolder);
  }, [selectedFolder, foldersMap]);

  return (
    <Row>
      <Col md={4}>
        <Container fluid className="p-2 mb-3">
          {Object.entries(foldersMap).map(
            ([folder, data]) =>
              folder !== "files" &&
              folder !== "totalFiles" && (
                <FolderTree
                  key={folder}
                  folderName={folder}
                  folderData={data}
                  onSelectFolder={setSelectedFolder}
                  selectedFolder={selectedFolder}
                />
              )
          )}
        </Container>
      </Col>

      <Col md={8}>
        <FileGrid
          files={selectedFolderData?.files || []}
          selectedFiles={selectedFiles}
          handleSetSelectedFiles={handleSetSelectedFiles}
          toggleFile={toggleFile}
        />
      </Col>
    </Row>
  );
}

function findNestedFolder(obj, target) {
  for (const key in obj) {
    if (key === target) return obj[key];
    if (typeof obj[key] === "object") {
      const found = findNestedFolder(obj[key], target);
      if (found) return found;
    }
  }
  return null;
}

export function SelectionSummary({ selectedFiles, handleResetFiles }) {
  return (
    <Stack direction="horizontal" className="p-2 w-100 justify-content-between">
      <div>
        <strong>{selectedFiles?.length}</strong> file(s) selected
      </div>
      <Button
        variant="primary"
        disabled={selectedFiles?.length === 0}
        onClick={() => {
          handleResetFiles();
        }}
      >
        Reset
      </Button>
    </Stack>
  );
}

function groupFilesByFolder(files) {
  const root = { "/": { files: [] } };

  for (const file of files) {
    const parts = file.path.replace(/^\/+/, "").split("/");
    let current = root["/"];

    if (parts.length === 1) {
      current.files.push(file);
      continue;
    }

    for (const folder of parts.slice(0, -1)) {
      current[folder] ??= { files: [] };
      current = current[folder];
    }

    current.files.push(file);
  }

  const calculateTotalFiles = (folder) => {
    const subTotals = Object.entries(folder)
      .filter(([k]) => k !== "files" && k !== "totalFiles")
      .reduce((sum, [, data]) => sum + calculateTotalFiles(data), 0);
    folder.totalFiles = (folder.files?.length || 0) + subTotals;
    return folder.totalFiles;
  };

  calculateTotalFiles(root["/"]);
  return root;
}

export default function FileBrowser({
  userDetails,
  selectedFiles,
  handleSetSelectedFiles,
}) {
  // Component that displays folders and files from the user's project storage
  // TODOs 
  // 1) Maybe handle better selectedFile. Right now is an array of file paths. Could be an array of file objects.
  // 2) Use maybe workspace or a default path for "path" param in inputs/outputs
  // 3) Maybe display better selected files. E.g., display selected files in folder rows.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderMap, setFolderMap] = useState({});

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
        setFolderMap(groupFilesByFolder(data || []));
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

  const toggleFile = useCallback(
    (file) => {
      handleSetSelectedFiles((prev) => {
        const alreadySelected = prev.some((f) => f.path === file.path);
        return alreadySelected
          ? prev.filter((f) => f.path !== file.path)
          : [...prev, file];
      });
    },
    [handleSetSelectedFiles]
  );

  const handleResetFiles = () => {
    handleSetSelectedFiles([]);
  };

  return (
    <Card className="border-0 shadow-sm rounded-3 mb-4">
      <Card.Header className="py-3">
        File Browser
        <small className="text-muted ms-2">
          ({Object.keys(folderMap["/"] || {}).length - 2} folders)
        </small>
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

        {!loading && Object.keys(folderMap)?.length === 0 && (
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

        {!loading && Object.keys(folderMap)?.length > 0 && (
          <FolderBrowser
            foldersMap={folderMap}
            selectedFiles={selectedFiles}
            handleSetSelectedFiles={handleSetSelectedFiles}
            toggleFile={toggleFile}
          />
        )}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between p-2">
        <SelectionSummary
          selectedFiles={selectedFiles}
          handleResetFiles={handleResetFiles}
        />
      </Card.Footer>
    </Card>
  );
}
