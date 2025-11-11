import { Stack, Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faCaretDown,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import { folderContainsFiles } from "../utils/folders";

export function FolderTree({
  folder,
  level = 0,
  onSelectFolder,
  selectedFolder,
  selectedFiles,
  expandedFolders,
  setExpandedFolders,
}) {
  const expanded = expandedFolders?.[folder.fullPath] ?? level === 0;
  const hasSubfolders =
    folder?.subfolders && Object.keys(folder?.subfolders ?? {})?.length > 0;

  return (
    <div style={{ marginLeft: level * 16 }}>
      <Stack
        direction="horizontal"
        gap={2}
        className="align-items-center p-2 rounded border bg-light mb-1"
        style={{
          cursor: "pointer",
          backgroundColor:
            folder?.fullPath === selectedFolder ? "#e9ecef" : "white",
          color:
            folder?.fullPath === selectedFolder ? "rgb(119, 0, 212)" : "#000",
        }}
        onClick={() => {
          onSelectFolder?.(folder?.fullPath);
          if (hasSubfolders) {
            setExpandedFolders((prev) => ({
              ...prev,
              [folder.fullPath]: !expanded,
            }));
          }
        }}
      >
        {hasSubfolders && (
          <FontAwesomeIcon
            icon={expanded ? faCaretDown : faCaretRight}
            style={{ width: "1rem" }}
          />
        )}
        <FontAwesomeIcon icon={faFolder} />
        <span>{folder?.name}</span>
        <span
          className="ms-auto text-muted small"
          style={{
            fontWeight: folderContainsFiles(folder ?? {}, selectedFiles ?? [])
              ? "bold"
              : "normal",
          }}
        >
          ({folder?.totalFiles ?? folder?.files?.length ?? 0})
        </span>
      </Stack>

      {hasSubfolders && (
        <Collapse in={expanded}>
          <div>
            {Object.values(folder?.subfolders ?? {})?.map((sub) => (
              <FolderTree
                key={sub?.fullPath}
                folder={sub}
                level={level + 1}
                onSelectFolder={onSelectFolder}
                selectedFolder={selectedFolder}
                selectedFiles={selectedFiles}
                expandedFolders={expandedFolders}
                setExpandedFolders={setExpandedFolders}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
}
