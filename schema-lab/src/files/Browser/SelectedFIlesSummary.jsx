import { Button, OverlayTrigger, Stack, Tooltip } from "react-bootstrap";
import { folderDoesNotContainFiles } from "../utils/folders";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export function SelectedFilesSummary({
  folderMap,
  selectedFiles,
  handleResetFiles,
  mode,
}) {
  const missingFiles = folderDoesNotContainFiles(folderMap, selectedFiles);

  return (
    <div className="p-2 w-100 ">
      {mode === "picker" && (
        <Stack
          direction="horizontal"
          className="justify-content-between"
          gap={3}
        >
          <div className="d-flex align-items-center gap-2">
            <strong>{selectedFiles?.length}</strong> file(s) selected
            {missingFiles && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="missing-files-tooltip">
                    Files {missingFiles.map((f) => f?.path)?.join(", ")} are
                    missing from the current folder.
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
            disabled={selectedFiles?.length === 0}
            onClick={() => {
              handleResetFiles();
            }}
          >
            Reset
          </Button>
        </Stack>
      )}
    </div>
  );
}
