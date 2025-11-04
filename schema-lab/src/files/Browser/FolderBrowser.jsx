import { useState, useMemo } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { findNestedFolder } from "../utils/utils";
import { FolderTree } from "./FolderTree";
import { FileGrid } from "./FileGrid";

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
    <Row className="flex-grow-1 h-100">
      <Col md={4} className="overflow-auto">
        <Container fluid className="p-2">
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

      <Col
        md={8}
        className="overflow-auto"
        style={{ borderLeft: "1px solid #dee2e6" }}
      >
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
