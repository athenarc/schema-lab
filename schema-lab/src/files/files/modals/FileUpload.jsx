import { useState } from "react";
import { Modal, Button, ProgressBar, Form, Alert } from "react-bootstrap";
import { uploadFile } from "../../../api/v1/files";
import { getFilenameFromPath } from "../../utils/utils";

const fileOverwrite = ({ fileToUpload, files }) => {
  if (!fileToUpload) return false;

  // Get base name of fileToUpload.name (should be just the filename)
  const uploadFileName = getFilenameFromPath(fileToUpload.name);

  return files.some((existing) => {
    // Extract base filename from existing.name (strip path)
    const existingFileName = getFilenameFromPath(existing?.path);
    return existingFileName === uploadFileName;
  });
};

const FileUploadModal = ({
  show,
  onClose,
  userDetails,
  onUploadSuccess,
  files = [],
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isOverwrite, setIsOverwrite] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setUploadSuccess(false);
    setError("");
    setProgress(0);
    setIsOverwrite(fileOverwrite({ fileToUpload: selectedFile, files }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setUploadSuccess(false);

    try {
      await uploadFile({
        path: "uploads",
        file,
        auth: userDetails,
        onProgress: (p) => setProgress(p),
      });
      setUploadSuccess(true);
      onUploadSuccess?.();
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setError("");
      setProgress(0);
      setUploadSuccess(false);
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-primary text-white" closeButton>
        <Modal.Title>Upload a File</Modal.Title>
      </Modal.Header>
      <Modal.Body className="m-auto p-4">
        <Form.Group controlId="fileInput">
          <Form.Label>Select a file to upload</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>

        {isOverwrite && file && (
          <div
            className="alert alert-warning d-flex flex-column p-3 rounded mt-4"
            role="alert"
            style={{ fontSize: "0.95rem", lineHeight: 1.4 }}
          >
            <div className="mb-1" style={{ fontWeight: "600" }}>
              Warning: File Name Conflict
            </div>
            <div>
              A file named{" "}
              <span className="fw-bold text-decoration-underline">
                {file.name}
              </span>{" "}
              already exists. Uploading will overwrite the existing file.
            </div>
          </div>
        )}

        {uploading && (
          <ProgressBar
            now={progress}
            label={`${Math.round(progress)}%`}
            className="my-3"
          />
        )}

        {uploadSuccess && (
          <div className="text-success mt-2">File uploaded successfully!</div>
        )}
        {error && <div className="text-danger mt-2">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUploadModal;
