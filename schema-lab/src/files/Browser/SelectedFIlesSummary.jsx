import {
  Button,
  OverlayTrigger,
  Stack,
  Tooltip,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import { folderDoesNotContainFiles } from "../utils/folders";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
  faTimesCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

export function SelectedFilesSummary({
  folderMap,
  selectedFiles,
  handleResetFiles,
  mode,
  status, // { message, statusType, status, progress }
}) {
  const missingFiles = folderDoesNotContainFiles?.(folderMap, selectedFiles);

  const getStatusVariant = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "success":
        return faCircleCheck;
      case "error":
        return faTimesCircle;
      case "warning":
        return faTriangleExclamation;
      default:
        return faCircleInfo;
    }
  };

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
        <div className="">
          {/* Upload Progress */}
          {status?.statusType === "uploading" && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-2 text-muted small">
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
                style={{ height: "1.2rem" }}
              />
            </div>
          )}

          {/* Informational / Success / Error / Warning */}
          {status?.message && status?.statusType !== "uploading" && (
            <Alert
              variant={getStatusVariant?.(status?.statusType)}
              className="d-flex align-items-center justify-content-between py-2 px-3 mb-0"
            >
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={getStatusIcon?.(status?.statusType)} />
                <span>{status?.message}</span>
              </div>
              {status?.onDismiss && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => status?.onDismiss?.()}
                >
                  ×
                </Button>
              )}
            </Alert>
          )}

          {/* Fallback - Idle state */}
          {!status?.message && !status?.statusType && (
            <div className="text-muted small text-center py-2">
              <em>No current activity</em>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
