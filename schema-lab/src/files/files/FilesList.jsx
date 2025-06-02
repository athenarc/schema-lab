import { useState, useCallback, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Tooltip,
  OverlayTrigger,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FileUploadModal from "./modals/FileUpload";
import {
  ColumnSortIcon,
  formatBytes,
  getFilenameFromPath,
  isPreviewable,
  timestampToDateOptions,
  fileOverwrite,
} from "../utils/utils";
import {
  faTrash,
  faPen,
  faFileDownload,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import { deleteFile, downloadFile, uploadFile } from "../../api/v1/files";
import FileEditModal from "./modals/FileEdit";
import FilePreviewModal from "./modals/FilePreview";
import FileUploadProgress from "./FileUploadProgress";

const FilesList = ({ files, userDetails, onUploadSuccess, error, loading }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const [sortKey, setSortKey] = useState("path");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filterName, setFilterName] = useState("");

  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showFileEditModal, setShowFileEditModal] = useState(false);
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
  const [fileToEdit, setFileToEdit] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOverwrite, setIsOverwrite] = useState(false);
  const [uploadAbortController, setUploadAbortController] = useState(null);

  // Memoized filtered and sorted files
  const filteredFiles = useMemo(() => {
    const lowerFilter = filterName.toLowerCase();
    return files.filter((file) =>
      file.path.toLowerCase().includes(lowerFilter)
    );
  }, [files, filterName]);

  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      const getVal = (file) =>
        sortKey === "size"
          ? file.metadata?.size
          : sortKey === "ts_modified"
          ? file.metadata?.ts_modified
          : file[sortKey];

      const aValue = getVal(a);
      const bValue = getVal(b);

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredFiles, sortKey, sortOrder]);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortOrder("asc");
      }
    },
    [sortKey]
  );

  const handleFileEdit = useCallback((file) => {
    setFileToEdit(file);
    setShowFileEditModal(true);
  }, []);

  const handleConfirmDelete = useCallback((file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(
    async (file) => {
      setDeleteLoading(true);
      try {
        await deleteFile({
          auth: userDetails.apiKey,
          path: file.path,
        });
        const updatedFiles = files.filter((f) => f.path !== file.path);
        onUploadSuccess(updatedFiles);
      } catch (err) {
        console.error("Error deleting file:", err);
      } finally {
        setDeleteLoading(false);
        setShowDeleteModal(false);
      }
    },
    [files, onUploadSuccess, userDetails.apiKey]
  );

  const handleFilePreview = useCallback((file) => {
    setFileToEdit(file);
    setShowFilePreviewModal(true);
  }, []);

  const startUpload = useCallback(
    async (file) => {
      if (!file) return;

      const controller = new AbortController();
      setUploadAbortController(controller);

      setUploading(true);
      setUploadProgress(0);
      setUploadError("");
      setUploadSuccess(false);

      try {
        await uploadFile({
          path: "uploads",
          file,
          auth: userDetails?.apiKey,
          onProgress: (p) => setUploadProgress(p),
          signal: controller.signal,
        });

        setUploadProgress(100);
        setUploadSuccess(true);
        setSelectedFile(null);
        onUploadSuccess();
      } catch (err) {
        if (err.name === "AbortError") {
          setUploadError("Upload cancelled by user");
        } else {
          setUploadError(err.message || "Upload failed");
        }
      } finally {
        setUploading(false);
        setUploadAbortController(null);
      }
    },
    [onUploadSuccess, userDetails?.apiKey]
  );

  const cancelUpload = useCallback(() => {
    uploadAbortController?.abort();
  }, [uploadAbortController]);

  const handleFileSelected = useCallback(
    (file) => {
      setSelectedFile(file);
      setIsOverwrite(fileOverwrite({ fileToUpload: file, files }));
      setShowFileUploadModal(false);
      startUpload(file);
    },
    [files, startUpload]
  );

  return (
    <Container fluid className="w-800">
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        file={fileToDelete}
      />

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="fw-bold border-bottom pb-2 mb-2 d-none d-md-flex">
        <Col
          md={6}
          onClick={() => handleSort("path")}
          style={{ cursor: "pointer" }}
        >
          File Name{" "}
          <ColumnSortIcon
            columnKey="path"
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </Col>
        <Col
          md={1}
          onClick={() => handleSort("size")}
          style={{ cursor: "pointer" }}
        >
          Size{" "}
          <ColumnSortIcon
            columnKey="size"
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </Col>
        <Col
          md={3}
          onClick={() => handleSort("ts_modified")}
          style={{ cursor: "pointer" }}
        >
          Created At{" "}
          <ColumnSortIcon
            columnKey="ts_modified"
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </Col>
        <Col md={2}>Actions</Col>
      </Row>

      <FileUploadProgress
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
      />

      <div
        className="px-2"
        style={{
          width: "100%",
          height: "530px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {loading && (
          <Row>
            <Col className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary" />
              <div className="mt-2">Loading files...</div>
            </Col>
          </Row>
        )}
        {!loading && sortedFiles.length === 0 && (
          <Row>
            <Col className="text-center">
              {error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                "No files uploaded yet!"
              )}
            </Col>
          </Row>
        )}
        {!loading &&
          sortedFiles.map((file) => {
            const previewable = isPreviewable(file?.path);
            return (
              <Row
                key={file.path}
                className="border rounded p-2 mb-3 mt-3 flex-column flex-md-row gx-3 align-items-center"
              >
                <Col xs={12} md={6} className="text-truncate">
                  <div className="fw-bold d-md-none">File Name</div>
                  {getFilenameFromPath(file?.path)}
                </Col>
                <Col xs={12} md={1}>
                  <div className="fw-bold d-md-none">Size</div>
                  {formatBytes(file?.metadata?.size)}
                </Col>
                <Col xs={12} md={3}>
                  <div className="fw-bold d-md-none">Created At</div>
                  {new Date(file?.metadata?.ts_modified).toLocaleDateString(
                    "en",
                    timestampToDateOptions
                  )}
                </Col>
                <Col xs="auto">
                  <div className="fw-bold d-md-none">Actions</div>
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleFileEdit(file)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleConfirmDelete(file)}
                      disabled={deleteLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        downloadFile({
                          auth: userDetails?.apiKey,
                          path: file.path,
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faFileDownload} />
                    </Button>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        !previewable ? (
                          <Tooltip id={`tooltip-disabled-${file.path}`}>
                            Preview available only for images or CSV files.
                          </Tooltip>
                        ) : (
                          <></>
                        )
                      }
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleFilePreview(file)}
                        disabled={!previewable}
                        style={!previewable ? { pointerEvents: "none" } : {}}
                      >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </Col>
              </Row>
            );
          })}
      </div>

      {!error && !loading && (
        <Row className="mt-3">
          <Col className="col-md-3 offset-md-9 text-end">
            <Button
              variant="primary"
              onClick={() => setShowFileUploadModal(true)}
              disabled={uploading}
            >
              Upload
            </Button>
          </Col>
        </Row>
      )}

      <FileUploadModal
        show={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        userDetails={userDetails?.apiKey}
        onFileSelected={handleFileSelected}
        files={sortedFiles}
      />

      <FileEditModal
        show={showFileEditModal}
        onClose={() => setShowFileEditModal(false)}
        file={fileToEdit}
        onUpdateSuccess={onUploadSuccess}
        userDetails={userDetails?.apiKey}
      />

      <FilePreviewModal
        show={showFilePreviewModal}
        onClose={() => setShowFilePreviewModal(false)}
        file={fileToEdit}
        userDetails={userDetails?.apiKey}
      />
    </Container>
  );
};

export default FilesList;
