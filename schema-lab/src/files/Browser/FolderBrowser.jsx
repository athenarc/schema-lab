import { Row, Col } from "react-bootstrap";
import { FileGrid } from "./FileGrid";
import { FolderRows } from "./FolderRows";

export function FolderBrowser({
  foldersMap = {},
  selectedFiles,
  selectedFolder = "/",
  setSelectedFolder,
  selectedFolderData,
  handleToggleFile,
  handleSetSelectedFiles,
  handleRefreshFiles,
  mode,
  userDetails,
  expandedFolders,
  setExpandedFolders,
  handleSetStatus,
}) {
  return (
    <Row className="flex-grow-1 h-100">
      <Col md={4} className="overflow-auto">
        <FolderRows
          foldersMap={foldersMap}
          setSelectedFolder={setSelectedFolder}
          selectedFolder={selectedFolder}
          selectedFiles={selectedFiles}
          expandedFolders={expandedFolders}
          setExpandedFolders={setExpandedFolders}
        />
      </Col>
      <Col md={8} style={{ borderLeft: "1px solid #dee2e6" }}>
        <FileGrid
          files={selectedFolderData?.files || []}
          selectedFiles={selectedFiles}
          handleSetSelectedFiles={handleSetSelectedFiles}
          handleToggleFile={handleToggleFile}
          handleRefreshFiles={handleRefreshFiles}
          mode={mode}
          userDetails={userDetails}
          handleSetStatus={handleSetStatus}
        />
      </Col>
    </Row>
  );
}
