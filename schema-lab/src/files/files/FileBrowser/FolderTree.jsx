import { useState } from "react";
import { Stack, Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faCaretDown,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";

export function FolderTree({
  folderName,
  folderData,
  level = 0,
  onSelectFolder,
  selectedFolder,
}) {
  const isRoot = level === 0;
  const [expanded, setExpanded] = useState(isRoot);
  const hasSubfolders = Object.keys(folderData).some(
    (k) =>
      k !== "files" && k !== "totalFiles" && typeof folderData[k] === "object"
  );
  return (
    <div style={{ marginLeft: level * 16 }}>
      <Stack
        direction="horizontal"
        gap={2}
        className="align-items-center p-2 rounded border bg-light mb-1"
        style={{
          cursor: "pointer",
          backgroundColor: folderName === selectedFolder ? "#e9ecef" : "white",
          color: folderName === selectedFolder ? "rgb(119, 0, 212)" : "#000",
        }}
        onClick={() => {
          onSelectFolder(folderName);
          if (!isRoot) setExpanded((prev) => !prev);
        }}
      >
        {hasSubfolders && !isRoot && (
          <FontAwesomeIcon
            icon={expanded ? faCaretDown : faCaretRight}
            style={{ width: "1rem" }}
          />
        )}

        <FontAwesomeIcon icon={faFolder} />
        <span>{folderName}</span>
        <span className="ms-auto text-muted small">
          ({folderData?.totalFiles || folderData.files?.length || 0})
        </span>
      </Stack>

      <Collapse in={expanded || isRoot}>
        <div>
          {Object.entries(folderData).map(([sub, data]) => {
            if (sub === "files" || sub === "totalFiles") return null;
            return (
              <FolderTree
                key={sub}
                folderName={sub}
                folderData={data}
                level={level + 1}
                onSelectFolder={onSelectFolder}
                selectedFolder={selectedFolder}
              />
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}
