import { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Tooltip,
  OverlayTrigger,
  ProgressBar,
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
import { fileOverwrite } from "../utils/utils";

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

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOverwrite, setIsOverwrite] = useState(false);
  const [uploadAbortController, setUploadAbortController] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredFiles = files.filter((file) =>
    file.path.toLowerCase().includes(filterName.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aValue =
      sortKey === "size"
        ? a.metadata?.size
        : sortKey === "ts_modified"
        ? a.metadata?.ts_modified
        : a[sortKey];
    const bValue =
      sortKey === "size"
        ? b.metadata?.size
        : sortKey === "ts_modified"
        ? b.metadata?.ts_modified
        : b[sortKey];

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleFileEdit = (file) => {
    setShowFileEditModal(true);
    setFileToEdit(file);
  };

  const handleDelete = async (file) => {
    setDeleteLoading(true);
    try {
      await deleteFile({
        auth: userDetails.apiKey,
        path: file.path,
      });
      const updatedFiles = files.filter((f) => f.path !== file.path);
      onUploadSuccess(updatedFiles);
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleConfirmDelete = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const handleFilePreview = (file) => {
    setShowFilePreviewModal(true);
    setFileToEdit(file);
  };

  const startUpload = async (file) => {
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
        auth: userDetails.apiKey,
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
  };

  const cancelUpload = () => {
    if (uploadAbortController) {
      uploadAbortController.abort();
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setIsOverwrite(fileOverwrite({ fileToUpload: file, files }));
    setShowFileUploadModal(false);
    startUpload(file);
  };

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

      {uploading && (
        <Row className="mb-3 align-items-center">
          <Col md={10}>
            <ProgressBar
              now={uploadProgress}
              label={`${Math.round(uploadProgress)}%`}
              animated
              striped
            />
            {isOverwrite && selectedFile && (
              <div
                className="alert alert-warning mt-2"
                style={{ fontSize: "0.9rem" }}
              >
                Warning: Uploading <strong>{selectedFile.name}</strong> will
                overwrite an existing file with the same name.
              </div>
            )}
          </Col>
          <Col md={2} className="text-end">
            <Button variant="outline-danger" size="sm" onClick={cancelUpload}>
              Cancel
            </Button>
          </Col>
        </Row>
      )}
      {uploadError && (
        <Row>
          <Col md={12}>
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <div>{uploadError}</div>
              <div>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="me-2"
                  onClick={() => startUpload(selectedFile)}
                >
                  Retry
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => {
                    setUploadError("");
                    setSelectedFile(null);
                  }}
                >
                  &times;
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}
      {uploadSuccess && (
        <Row>
          <Col md={12}>
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <div>File uploaded successfully!</div>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => {
                  setUploadSuccess(false);
                  setSelectedFile(null);
                }}
              >
                &times;
              </Button>
            </div>
          </Col>
        </Row>
      )}

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
        {sortedFiles.length === 0 && !loading && (
          <Row>
            {error ? (
              <Col className="text-center">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </Col>
            ) : (
              <Col className="text-center">No files uploaded yet!</Col>
            )}
          </Row>
        )}
        {!loading &&
          sortedFiles.map((file, index) => {
            const previewable = isPreviewable(file?.path);
            return (
              <Row
                key={index}
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
                          <Tooltip id={`tooltip-disabled-${index}`}>
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
        userDetails={userDetails}
      />

      <FilePreviewModal
        show={showFilePreviewModal}
        onClose={() => setShowFilePreviewModal(false)}
        file={fileToEdit}
        userDetails={userDetails}
      />
    </Container>
  );
};

export default FilesList;
