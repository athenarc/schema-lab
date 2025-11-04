import { useCallback, useEffect, useState } from "react";
import { Card, Spinner, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { getFiles } from "../../api/v1/files";
import { groupFilesByFolder } from "../utils/utils";
import { SelectedFilesSummary } from "./SelectedFIlesSummary";

import { FolderBrowser } from "./FolderBrowser";

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
  // 4) Fix File Browser (-2 folders) count in header when no files are present.
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
    <Card
      className="border-0 shadow-sm rounded-3 h-100 d-flex flex-column"
      style={{ minHeight: "400px" }}
    >
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

      <Card.Body className="p-2 flex-grow-1 d-flex flex-column">
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
        <SelectedFilesSummary
          selectedFiles={selectedFiles}
          handleResetFiles={handleResetFiles}
        />
      </Card.Footer>
    </Card>
  );
}
