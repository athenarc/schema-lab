import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { formatBytes, timestampToDateOptions } from "../utils/utils";
import { FileDropdownActions } from "./FileDropdownActions";

function SelectedTick() {
  return (
    <div
      style={{
        position: "absolute",
        top: "6px",
        right: "6px",
        background: "rgb(119, 0, 212)",
        color: "white",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        boxShadow: "0 0 4px rgba(0,0,0,0.2)",
      }}
    >
      ✓
    </div>
  );
}

export function FileCard({
  file,
  isSelected,
  onToggle,
  onDelete,
  onRename,
  handleRefreshFiles,
  mode,
}) {
  const filename = file?.path?.split("/").pop();

  return (
    <Card
      className={`position-relative p-2 shadow-sm rounded-3 ${
        isSelected ? "border-primary border-2" : "border-1"
      }`}
      style={{
        cursor: mode === "picker" ? "pointer" : "default",
        backgroundColor: isSelected ? "#f0f7ff" : "white",
        transition: "all 0.2s ease-in-out",
      }}
      onClick={onToggle}
    >
      {isSelected && <SelectedTick />}

      <Card.Header
        className="bg-light fw-semibold d-flex align-items-center justify-content-between"
        style={{ fontSize: "0.9rem" }}
      >
        <span className="text-truncate" title={filename}>
          {filename}
        </span>
        {mode === "browser" && (
          <FileDropdownActions
            onRename={onRename}
            onDelete={onDelete}
            file={file}
            handleRefreshFiles={handleRefreshFiles}
          />
        )}
      </Card.Header>

      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
        <FontAwesomeIcon
          icon={faFolder}
          size="2x"
          className="mb-2"
          style={{
            color: isSelected ? "rgb(119, 0, 212)" : "#adb5bd",
            transition: "color 0.3s ease",
          }}
        />
        <div className="small text-muted">
          {formatBytes(file?.metadata?.size) || "-"}
        </div>
        <div style={{ fontSize: "0.75rem" }}>
          {new Date(file?.metadata?.ts_modified).toLocaleDateString(
            "en",
            timestampToDateOptions
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
