import {
  Button,
  OverlayTrigger,
  Stack,
  Tooltip,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import { useCallback, useEffect } from "react";
import { folderDoesNotContainFiles } from "../utils/folders";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faUpload,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { getStatusIcon } from "../utils/utils";

export function SelectedFilesSummary({
  folderMap,
  selectedFiles,
  handleResetFiles,
  mode,
  status, // { message, statusType, status, progress, onDismiss, onRetry, onCancel }
  handleSetStatus,
}) {
  const missingFiles = folderDoesNotContainFiles?.(folderMap, selectedFiles);

  const handleDismiss = useCallback(() => {
    handleSetStatus((prev) => ({
      ...prev,
      message: "",
      statusType: "",
      status: 0,
    }));
  }, [handleSetStatus]);

  useEffect(() => {
    if (
      status?.message &&
      status?.statusType !== "uploading" &&
      !(status?.statusType === "error" && status?.onRetry)
    ) {
      const timer = setTimeout(() => handleDismiss(), 5000);
      return () => clearTimeout(timer);
    }
  }, [status, handleDismiss]);
  return (
    <div className="p-2 w-100">
      {/* Mode: Picker */}
      {mode === "picker" && (
        <Stack
          direction="horizontal"
          className="justify-content-between"
          gap={3}
        >
          <div className="d-flex align-items-center gap-2">
            <strong>{selectedFiles?.length ?? 0}</strong> file(s) selected
            {missingFiles?.length > 0 && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="missing-files-tooltip">
                    Files {missingFiles?.map?.((f) => f?.path)?.join?.(", ")}{" "}
                    are missing from the current folder.
                  </Tooltip>
                }
              >
                <div className="text-danger">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-1"
                  />
                </div>
              </OverlayTrigger>
            )}
          </div>

          <Button
            variant="primary"
            disabled={!selectedFiles?.length}
            onClick={() => handleResetFiles?.()}
          >
            Reset
          </Button>
        </Stack>
      )}

      {/* Mode: Browser */}
      {mode === "browser" && (
        <div className="d-flex flex-column gap-2">
          {/* Upload Card */}
          {status?.statusType === "uploading" && (
            <div className="p-3 bg-light rounded shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2 text-muted">
                  <FontAwesomeIcon icon={faUpload} />
                  Uploading file...
                </div>
                <span className="small">
                  {Math.round(status?.progress ?? 0)}%
                </span>
              </div>
              <ProgressBar
                now={status?.progress ?? 0}
                animated
                striped
                variant="primary"
                style={{ height: "1.5rem", borderRadius: "0.5rem" }}
              />
              {status?.onCancel && (
                <div className="d-flex justify-content-end mt-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={status.onCancel}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Status Alerts */}
          {status?.message && status?.statusType !== "uploading" && (
            <Alert
              className="d-flex justify-content-between align-items-center p-2 rounded mb-0"
              style={{
                color: "#000",
                backgroundColor:
                  status?.statusType === "success"
                    ? "rgba(40, 167, 69, 0.1)"
                    : status?.statusType === "error"
                    ? "rgba(220, 53, 69, 0.1)"
                    : status?.statusType === "warning"
                    ? "rgba(255, 193, 7, 0.1)"
                    : "rgba(23, 162, 184, 0.1)",
                border: `1px solid ${
                  status?.statusType === "success"
                    ? "#28a745"
                    : status?.statusType === "error"
                    ? "#dc3545"
                    : status?.statusType === "warning"
                    ? "#ffc107"
                    : "#17a2b8"
                }`,
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon
                  icon={getStatusIcon(status?.statusType)}
                  style={{
                    color:
                      status?.statusType === "success"
                        ? "#28a745"
                        : status?.statusType === "error"
                        ? "#dc3545"
                        : status?.statusType === "warning"
                        ? "#ffc107"
                        : "#17a2b8",
                  }}
                />
                <span>{status?.message}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                {status?.statusType === "error" && status?.onRetry && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={status.onRetry}
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="me-1" />
                    Retry
                  </Button>
                )}
                <Button
                  style={{
                    color:
                      status?.statusType === "success"
                        ? "#28a745"
                        : status?.statusType === "error"
                        ? "#dc3545"
                        : status?.statusType === "warning"
                        ? "#ffc107"
                        : "#17a2b8",
                    border: "none",
                    backgroundColor: "transparent",
                    padding: "0 8px",
                    fontSize: "1.2rem",
                    lineHeight: "1",
                    borderRadius: "0.25rem",
                    boxShadow: "none",
                    textDecoration: "none",
                  }}
                  size="sm"
                  onClick={handleDismiss}
                >
                  ×
                </Button>
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
