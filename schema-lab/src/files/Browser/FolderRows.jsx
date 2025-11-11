import { Container } from "react-bootstrap";
import { FolderTree } from "./FolderTree";

export function FolderRows({
  foldersMap,
  setSelectedFolder,
  selectedFolder,
  selectedFiles,
  expandedFolders,
  setExpandedFolders,
}) {
  return (
    <Container fluid className="p-2">
      <FolderTree
        folder={foldersMap}
        level={0}
        onSelectFolder={setSelectedFolder}
        selectedFolder={selectedFolder}
        selectedFiles={selectedFiles}
        expandedFolders={expandedFolders}
        setExpandedFolders={setExpandedFolders}
      />
    </Container>
  );
}
