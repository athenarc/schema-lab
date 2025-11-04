import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { formatBytes, timestampToDateOptions } from "../../utils/utils";

export function FileCard({ file, isSelected, onToggle }) {
  return (
    <Card
      className={`position-relative p-2 border-0 shadow-sm rounded-3 ${
        isSelected ? "border-primary border-2" : "border-light"
      }`}
      style={{
        cursor: "pointer",
        backgroundColor: isSelected ? "#f0f7ff" : "white",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = isSelected
          ? "#f0f7ff"
          : "white")
      }
      onClick={onToggle}
    >
      {isSelected && (
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
      )}

      <Card.Header
        className="bg-light text-center fw-semibold text-truncate"
        title={file?.path?.split("/").pop()}
        style={{ fontSize: "0.9rem", maxWidth: "100%" }}
      >
        {file?.path?.split("/").pop()}
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
        <div className="" style={{ fontSize: "0.75rem" }}>
          {new Date(file?.metadata?.ts_modified).toLocaleDateString(
            "en",
            timestampToDateOptions
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
