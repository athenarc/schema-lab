import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import FileUploadModal from "../modals/FileUpload";
import { useCallback, useState, useRef } from "react";
import { wouldOverwriteFile } from "../utils/files";
import { uploadFile } from "../../api/v1/files";
import { getCommonDirectoryPrefix } from "../utils/paths";

export function FileListControls({
  searchTerm,
  setSearchTerm,
  allSelected,
  handleSelectAll,
  handleClearSelection,
  mode,
  userDetails,
  files = [],
  handleRefreshFiles,
  handleSetStatus,
}) {
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Use ref for AbortController to avoid async state issues
  const uploadAbortControllerRef = useRef(null);

  const cancelUpload = useCallback(() => {
    if (uploadAbortControllerRef.current) {
      uploadAbortControllerRef.current.abort();
    }
  }, []);

  const currentPath = getCommonDirectoryPrefix(files.map((f) => f.path));

  const startUpload = useCallback(
    async (file) => {
      if (!file) return;

      const controller = new AbortController();
      uploadAbortControllerRef.current = controller;

      setUploading(true);
      handleSetStatus({
        message: "Uploading file...",
        statusType: "uploading",
        status: 0,
        progress: 0,
        onDismiss: cancelUpload,
        onRetry: () => startUpload(file),
        onCancel: cancelUpload,
      });

      try {
        await uploadFile({
          path: currentPath?.replace(/\/$/, ""),
          file,
          auth: userDetails?.apiKey,
          onProgress: (p) =>
            handleSetStatus((prev) => ({ ...prev, progress: p })),
          signal: controller.signal,
        });

        handleSetStatus({
          message: "File uploaded successfully.",
          statusType: "success",
          status: 200,
          progress: 100,
        });
      } catch (err) {
        if (err.name === "AbortError") {
          handleSetStatus({
            message: "Upload cancelled by user",
            statusType: "error",
            status: 0,
            progress: 0,
            onCancel: null,
          });
        } else {
          handleSetStatus({
            message: err.message || "Upload failed",
            statusType: "error",
            status: 500,
            progress: 0,
            onRetry: () => startUpload(file),
          });
        }
      } finally {
        setUploading(false);
        uploadAbortControllerRef.current = null;
        handleRefreshFiles();
      }
    },
    [
      currentPath,
      handleRefreshFiles,
      userDetails?.apiKey,
      handleSetStatus,
      cancelUpload,
    ]
  );

  const handleFileSelected = useCallback(
    (file) => {
      setShowFileUploadModal(false);
      startUpload(file);
    },
    [startUpload]
  );

  return (
    <>
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-3 gap-2 border-bottom pb-3">
        <div className="flex-grow-1 me-md-2" style={{ minWidth: 0 }}>
          <InputGroup>
            <InputGroup.Text className="bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search files in the folder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />
          </InputGroup>
        </div>

        {mode === "picker" && (
          <div className="d-flex gap-2 mt-2 mt-md-0 flex-shrink-0">
            <Button
              variant={allSelected ? "outline-secondary" : "outline-primary"}
              onClick={handleSelectAll}
            >
              <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
            <Button variant="outline-danger" onClick={handleClearSelection}>
              <FontAwesomeIcon icon={faSquareXmark} className="me-1" />
              Clear
            </Button>
          </div>
        )}

        {mode === "browser" && (
          <Button
            variant="primary"
            onClick={() => setShowFileUploadModal(true)}
            disabled={uploading}
          >
            Upload
          </Button>
        )}

        <FileUploadModal
          show={showFileUploadModal}
          onClose={() => setShowFileUploadModal(false)}
          userDetails={userDetails?.apiKey}
          onFileSelected={handleFileSelected}
          files={files}
        />
      </div>
    </>
  );
}
