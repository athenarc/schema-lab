import { useCallback, useEffect, useState, useContext, useMemo } from "react";
import { Card, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { getFiles } from "../../api/v1/files";
import {
  buildFolderTree,
  countFolders,
  findNestedFolder,
} from "../utils/folders";
import { SelectedFilesSummary } from "./SelectedFIlesSummary";

import { FolderBrowser } from "./FolderBrowser";
import LoadingComponent from "../utils/LoadingComponent";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";

export default function FileBrowserCard({
  selectedFiles,
  handleSetSelectedFiles,
  handleResetFiles,
  mode = "browse",
}) {
  // Component that displays folders and files from the user's project storage
  //
  // TODOs
  // Maybe display better selected files. E.g., display selected files in folder rows.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderMap, setFolderMap] = useState({});
  const [selectedFolder, setSelectedFolder] = useState("/");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [status, setStatus] = useState({
    message: "test",
    statusType: "success",
    status: 0,
    progress: 40,
  });
  const { userDetails } = useContext(UserDetailsContext);

  const expandFolderPath = useCallback((path) => {
    const parts = path?.split("/")?.filter(Boolean);
    let current = "";
    const expanded = {};
    if (path === "/") {
      expanded["/"] = true;
    }
    for (const part of parts) {
      current += "/" + part;
      expanded[current] = !expanded[current];
    }

    setExpandedFolders((prev) => ({ ...prev, ...expanded }));
  }, []);

  useEffect(() => {
    if (selectedFolder) expandFolderPath(selectedFolder);
  }, [selectedFolder, expandFolderPath]);

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

  const onSetStatus = (status) => {
    setStatus(status);
  };

  const selectedFolderData = useMemo(() => {
    return findNestedFolder(folderMap, selectedFolder) || { files: [] };
  }, [selectedFolder, folderMap]);

  return (
    <Card
      className="border-0 shadow-sm rounded-3 flex-grow-1 h-100 d-flex flex-column"
      style={{ minHeight: "500px" }}
    >
      <Card.Header className="p-2">
        File Browser
        <small className="text-muted ms-2">
          ({countFolders(folderMap || {})} folders)
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
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            selectedFolderData={selectedFolderData}
            handleToggleFile={mode === "picker" ? toggleFile : () => {}}
            handleRefreshFiles={fetchFiles}
            mode={mode}
            userDetails={userDetails}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
            handleSetStatus={onSetStatus}
          />
        )}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between p-2">
        <SelectedFilesSummary
          folderMap={folderMap}
          selectedFiles={selectedFiles}
          handleResetFiles={handleResetFiles}
          status={status}
          handleSetStatus={onSetStatus}
          mode={mode}
        />
      </Card.Footer>
    </Card>
  );
}
