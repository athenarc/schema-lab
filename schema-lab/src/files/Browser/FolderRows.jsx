import { Container } from "react-bootstrap";
import { FolderTree } from "./FolderTree";

export function FolderRows({ foldersMap, setSelectedFolder, selectedFolder, selectedFiles }) {
  return (
    <Container fluid className="p-2">
      {Object?.entries(foldersMap)?.map(
        ([folder, folderData]) =>
          folder !== "files" &&
          folder !== "totalFiles" && (
            <FolderTree
              key={folder}
              folderName={folder}
              folderData={folderData}
              onSelectFolder={setSelectedFolder}
              selectedFolder={selectedFolder}
              selectedFiles={selectedFiles}
            />
          )
      )}
    </Container>
  );
}
