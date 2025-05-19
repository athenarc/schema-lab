import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { renameOrMoveFile } from "../../../api/v1/files";

const FileUploadModal = ({
  show,
  onClose,
  userDetails,
  onUploadSuccess,
  file,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [renameSuccess, setRenameSuccess] = useState(false);
  const [error, setError] = useState("");
  const [newFilename, setNewFilename] = useState("");

  const inputRef = useRef(null);

  const getFilenameFromPath = (path) => {
    if (!path) return "";
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  useEffect(() => {
    if (show && file?.path) {
      setNewFilename(getFilenameFromPath(file.path));
      setError("");
      setRenameSuccess(false);

      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [show, file]);

  useEffect(() => {
    if (renameSuccess) {
      const timer = setTimeout(() => setRenameSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [renameSuccess]);

  const handleFilenameChange = (e) => {
    const val = e.target.value;
    setNewFilename(val);

    if (val.trim() === "") {
      setError("Filename cannot be empty.");
    } else if (val === getFilenameFromPath(file?.path)) {
      setError("The new filename must be different from the current filename.");
    } else {
      setError("");
    }
  };

  const handleFileRename = async () => {
    if (!file || !newFilename) return;

    const oldPath = file.path;
    const oldFilename = getFilenameFromPath(oldPath);

    if (newFilename === oldFilename) {
      setError("The new filename must be different from the current filename.");
      return;
    }

    if (newFilename.trim() === "") {
      setError("Filename cannot be empty.");
      return;
    }

    setRenaming(true);
    setError("");
    setRenameSuccess(false);

    try {
      const basePath = oldPath.substring(0, oldPath.lastIndexOf("\\") + 1);
      const newPath = basePath + newFilename;

      await renameOrMoveFile({
        auth: userDetails,
        oldPath,
        newPath,
      });

      setRenameSuccess(true);
      onUploadSuccess?.();
    } catch (err) {
      setError(err.message || "Rename failed");
      console.error(err);
    } finally {
      setRenaming(false);
    }
  };

  const handleClose = () => {
    if (!renaming) {
      setError("");
      setRenameSuccess(false);
      setNewFilename("");
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-primary text-white" closeButton>
        <Modal.Title>Rename {getFilenameFromPath(file?.path)}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form.Group controlId="fileInput">
          <Form.Label>New filename</Form.Label>
          <Form.Control
            ref={inputRef}
            type="text"
            value={newFilename}
            onChange={handleFilenameChange}
            placeholder="Enter new filename, e.g. document.pdf"
            disabled={renaming}
            autoComplete="off"
          />
          <div className="mt-2 text-muted">
            Current file name: {getFilenameFromPath(file?.path)}
          </div>
        </Form.Group>

        <div style={{ minHeight: "28px", marginTop: "8px" }}>
          {renameSuccess && (
            <div className="text-success">File renamed successfully!</div>
          )}
          {error && <div className="text-danger">{error}</div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={renaming}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleFileRename}
          disabled={!file || renaming || !newFilename || !!error}
        >
          {renaming ? "Renaming..." : "Rename"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUploadModal;
