import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import FileUploadModal from "../modals/FileUpload";
import { useCallback, useState } from "react";
import { wouldOverwriteFile } from "../utils/files";
import { uploadFile } from "../../api/v1/files";
import FileUploadProgress from "../Dashboard/FileUploadProgress";
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOverwrite, setIsOverwrite] = useState(false);
  const [uploadAbortController, setUploadAbortController] = useState(null);

  const cancelUpload = useCallback(() => {
    uploadAbortController?.abort();
  }, [uploadAbortController]);
  const currentPath = getCommonDirectoryPrefix(files.map((f) => f.path));

  const startUpload = useCallback(
    async (file) => {
      if (!file) return;

      const controller = new AbortController();
      setUploadAbortController(controller);

      setUploading(true);
      handleSetStatus({
        message: "Uploading file...",
        statusType: "uploading",
        status: 0,
        progress: 0,
      });

      try {
        await uploadFile({
          // replace trailing /slash from path
          path: currentPath?.replace(/\/$/, ""),
          file,
          auth: userDetails?.apiKey,
          onProgress: (p) =>
            handleSetStatus((prev) => ({ ...prev, progress: p })),
          signal: controller.signal,
        });

        handleSetStatus((prev) => ({
          ...prev,
          progress: 100,
          message: "File uploaded successfully.",
          statusType: "success",
          status: 200,
        }));
        setSelectedFile(null);
      } catch (err) {
        if (err.name === "AbortError") {
          handleSetStatus({
            message: "Upload cancelled by user",
            statusType: "error",
            status: 0,
            progress: 0,
          });
        } else {
          handleSetStatus({
            message: err.message || "Upload failed",
            statusType: "error",
            status: 500,
            progress: 0,
          });
        }
      } finally {
        setUploading(false);
        setUploadAbortController(null);
        handleRefreshFiles();
      }
    },
    [currentPath, handleRefreshFiles, userDetails?.apiKey, handleSetStatus]
  );
  const handleFileSelected = useCallback(
    (file) => {
      setSelectedFile(file);

      setIsOverwrite(
        wouldOverwriteFile({ fileToUpload: file, existingFiles: files })
      );
      setShowFileUploadModal(false);
      startUpload(file);
    },
    [files, startUpload]
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
      {/* <FileUploadProgress
        uploading={uploading}
        selectedFile={selectedFile}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
        setUploadError={setUploadError}
        setSelectedFile={setSelectedFile}
        setUploadSuccess={setUploadSuccess}
        uploadProgress={uploadProgress}
        isOverwrite={isOverwrite}
        cancelUpload={cancelUpload}
        startUpload={startUpload}
        unzipError={unzipError}
        setUnzipError={setUnzipError}
        unzipSuccess={unzipSuccess}
        setUnzipSuccess={setUnzipSuccess}
        deleteError={deleteError}
        setDeleteError={setDeleteError}
        deleteSuccess={deleteSuccess}
        setDeleteSuccess={setDeleteSuccess}
      /> */}
    </>
  );
}
