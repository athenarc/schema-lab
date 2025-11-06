import { useState, useMemo } from "react";
import { Row, Col } from "react-bootstrap";
import { findNestedFolder } from "../utils/folders";
import { FileGrid } from "./FileGrid";
import { FolderRows } from "./FolderRows";

export function FolderBrowser({
  foldersMap = {},
  selectedFiles,
  handleToggleFile,
  handleSetSelectedFiles,
}) {
  const [selectedFolder, setSelectedFolder] = useState("/");

  const selectedFolderData = useMemo(() => {
    // Get the data for the currently selected folder
    // If the current folder is root ("/"), return the root folder data
    // data => files and nested folders
    return selectedFolder === "/"
      ? foldersMap["/"]
      : findNestedFolder(foldersMap, selectedFolder);
  }, [selectedFolder, foldersMap]);

  return (
    <Row className="flex-grow-1 h-100">
      <Col md={4} className="overflow-auto">
        <FolderRows
          foldersMap={foldersMap}
          setSelectedFolder={setSelectedFolder}
          selectedFolder={selectedFolder}
          selectedFiles={selectedFiles}
        />
      </Col>
      <Col md={8} style={{ borderLeft: "1px solid #dee2e6" }}>
        <FileGrid
          files={selectedFolderData?.files || []}
          selectedFiles={selectedFiles}
          handleSetSelectedFiles={handleSetSelectedFiles}
          handleToggleFile={handleToggleFile}
        />
      </Col>
    </Row>
  );
}
