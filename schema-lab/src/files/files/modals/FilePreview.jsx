import { useEffect, useState } from "react";
import { Modal, Button, Spinner, Alert, Table } from "react-bootstrap";
import { getFilePreview } from "../../../api/v1/files";

const FilePreviewModal = ({ show, onClose, userDetails, file }) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState("");

  const handleClose = () => {
    setPreviewData(null);
    setError("");
    onClose();
  };

  useEffect(() => {
    if (!show || !file?.path) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError("");
      setPreviewData(null);
      try {
        const result = await getFilePreview({
          auth: userDetails,
          path: file.path,
        });
        setPreviewData(result);
      } catch (err) {
        setError(err.message || "Failed to load preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [show, file?.path, userDetails]);

  const renderCsvTable = (rows) => {
    const hasHeader = rows.length > 1;
    return (
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <Table striped bordered hover size="sm" responsive>
          <thead>
            {hasHeader && (
              <tr>
                {rows[0].map((headerCell, idx) => (
                  <th key={idx}>{headerCell}</th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {rows.slice(hasHeader ? 1 : 0).map((row, rowIndex) => (
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
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    if (previewData.type === "image") {
      return (
        <img
          src={previewData.url}
          alt="File Preview"
          style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "4px" }}
        />
      );
    }

    if (previewData.type === "csv") {
      return renderCsvTable(previewData.preview);
    }

    return <Alert variant="warning">Unsupported file type.</Alert>;
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          File Preview{" "}
          {file?.name && (
            <small className="ms-2 text-light">({file.name})</small>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "250px" }}
      >
        {loading ? (
          <Spinner animation="border" variant="primary" />
        ) : error ? (
          <Alert variant="danger" className="w-100 text-center">
            {error}
          </Alert>
        ) : (
          renderPreviewContent()
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
