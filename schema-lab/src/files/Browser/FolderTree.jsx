import { useEffect, useState } from "react";
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
  const expanded = expandedFolders?.[folder?.fullPath] ?? level === 0;
  const [expandedState, setExpandedState] = useState(expanded);

  // Sync local state with global expandedFolders when updated externally
  useEffect(() => {
    setExpandedState(expanded);
  }, [expanded]);

  // Sync local expanded state back to global for persistence
  useEffect(() => {
    if (!folder?.fullPath) return;
    setExpandedFolders?.((prev) => ({
      ...prev,
      [folder?.fullPath]: expandedState,
    }));
  }, [expandedState, folder?.fullPath, setExpandedFolders]);

  const hasSubfolders =
    folder?.subfolders && Object.keys(folder?.subfolders ?? {})?.length > 0;

  return (
    <div style={{ marginLeft: level * 16 }}>
      <Stack
        direction="horizontal"
        gap={2}
        className="align-items-center p-2 rounded mb-1"
        style={{
          cursor: "pointer",
          backgroundColor:
            folder?.fullPath === selectedFolder ? "#f2f0ff" : "white",
          color:
            folder?.fullPath === selectedFolder ? "rgb(119, 0, 212)" : "#000",
          border: "1px solid #dee2e6",
          transition: "background-color 0.2s ease",
        }}
        onClick={() => onSelectFolder?.(folder?.fullPath)}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f8f9fa")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor =
            folder?.fullPath === selectedFolder ? "#f2f0ff" : "white")
        }
      >
        {hasSubfolders && (
          <FontAwesomeIcon
            icon={expandedState ? faCaretDown : faCaretRight}
            style={{ width: "1rem", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedState((prev) => !prev);
            }}
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
        <Collapse in={expandedState}>
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
