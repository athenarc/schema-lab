import { useState } from "react";
import { Modal, Button, ProgressBar, Form } from "react-bootstrap";
import { uploadFile } from "../../../api/v1/files";

const FileUploadModal = ({ show, onClose, userDetails, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadSuccess(false);
    setError("");
    setProgress(0);
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
      onUploadSuccess?.(); // Trigger refetch of files
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
