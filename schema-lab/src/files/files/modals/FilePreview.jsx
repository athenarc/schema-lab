import { useEffect, useState } from "react";
import { Modal, Button, Spinner, Alert, Table } from "react-bootstrap";
import { getFilePreview } from "../../../api/v1/files";

const FilePreviewModal = ({ show, onClose, userDetails, file }) => {
  console.log(file);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleClose = () => {
    setPreview(null);
    setError("");
    onClose();
  };

  useEffect(() => {
    if (!show || !file?.path) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError("");
      setPreview(null);
      try {
        const result = await getFilePreview({
          auth: userDetails,
          path: file?.path,
        });
        setPreview(result);
      } catch (err) {
        setError(err.message || "Failed to load preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [show, file?.path, userDetails]);

  const renderPreview = () => {
    if (!preview) return null;

    if (preview.type === "image") {
      return (
        <img
          src={preview.url}
          alt="File Preview"
          style={{ maxWidth: "100%", maxHeight: "400px" }}
        />
      );
    }

    if (preview.type === "csv") {
      return (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <Table striped bordered hover size="sm">
            <tbody>
              {preview.preview.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    }

    return <Alert variant="warning">Unsupported file type</Alert>;
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header className="bg-primary text-white" closeButton>
        <Modal.Title>Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          renderPreview()
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilePreviewModal;
