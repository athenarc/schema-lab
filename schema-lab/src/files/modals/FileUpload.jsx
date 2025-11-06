import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { wouldOverwriteFile } from "../utils/files";

const FileUploadModal = ({ show, onClose, files = [], onFileSelected }) => {
  const [file, setFile] = useState(null);
  const [isOverwrite, setIsOverwrite] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setIsOverwrite(wouldOverwriteFile({ fileToUpload: selectedFile, files }));
  };

  const handleUploadClick = () => {
    if (file) {
      onFileSelected(file);
      setFile(null);
    }
  };

  const handleClose = () => {
    if (!file) setIsOverwrite(false);
    onClose();
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleUploadClick} disabled={!file}>
          Upload
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUploadModal;
