import { useCallback, useEffect, useState, useContext } from "react";
import { Card, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { getFiles } from "../../api/v1/files";
import { buildFolderTree, countFolders } from "../utils/folders";
import { SelectedFilesSummary } from "./SelectedFIlesSummary";

import { FolderBrowser } from "./FolderBrowser";
import LoadingComponent from "../utils/LoadingComponent";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";

export default function FileBrowserCard({
  selectedFiles,
  handleSetSelectedFiles,
}) {
  // Component that displays folders and files from the user's project storage
  //
  // TODOs
  // Maybe display better selected files. E.g., display selected files in folder rows.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderMap, setFolderMap] = useState({});
  const { userDetails } = useContext(UserDetailsContext);

  const fetchFiles = useCallback(() => {
    setLoading(true);
    getFiles({ auth: userDetails?.apiKey, recursive: "yes" })
      .then((res) => {
        if (!res?.ok) {
          if (res?.status === 500) {
            throw new Error("Internal Server Error (500)");
          }
          throw new Error(`HTTP error! status: ${res?.status}`);
        }
        return res?.json();
      })
      .then((data) => {
        setFolderMap(buildFolderTree(data || []));
        setError(null);
      })
      .catch((err) => {
        console?.error("Failed to fetch files:", err?.message);
        setError(err?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userDetails?.apiKey]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const toggleFile = useCallback(
    (file) => {
      handleSetSelectedFiles((prev) => {
        const alreadySelected = prev?.some((f) => f?.path === file?.path);
        return alreadySelected
          ? prev?.filter((f) => f?.path !== file?.path)
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
      className="border-0 shadow-sm rounded-3 flex-grow-1 h-100 d-flex flex-column"
      style={{ minHeight: "500px" }}
    >
      <Card.Header className="p-2">
        File Browser
        <small className="text-muted ms-2">
          ({countFolders(folderMap["/"] || {})} folders)
        </small>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="refresh-tooltip">Refresh Files</Tooltip>}
        >
          <FontAwesomeIcon
            icon={faRedo}
            className="ms-2 text-primary"
            style={{ cursor: "pointer" }}
            onClick={fetchFiles}
          />
        </OverlayTrigger>
      </Card.Header>

      <Card.Body className="p-2 flex-grow-1 d-flex flex-column">
        {loading && <LoadingComponent message="Loading files..." />}

        {!loading && Object?.keys(folderMap)?.length === 0 && (
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

        {!loading && Object?.keys(folderMap)?.length > 0 && (
          <FolderBrowser
            foldersMap={folderMap}
            selectedFiles={selectedFiles}
            handleSetSelectedFiles={handleSetSelectedFiles}
            handleToggleFile={toggleFile}
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
