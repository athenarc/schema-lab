import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Spinner,
  Alert,
  Table,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { getFileTypePreview } from "../../api/v1/files";

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
        const result = await getFileTypePreview({
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

  const renderMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    return (
      <Card className="mb-3">
        <Card.Header className="bg-light fw-bold">File Metadata</Card.Header>
        <Card.Body>
          <Row>
            {Object.entries(metadata).map(([key, value]) => (
              <Col sm={6} md={4} lg={3} key={key} className="mb-2">
                <strong>{key}:</strong> <span>{value}</span>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const parseCsvPreview = (text) => {
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) =>
        line.split(",").map((cell) => cell.trim())
      );
  };

  const renderCsvTable = (previewText) => {
    const rows = parseCsvPreview(previewText);
    if (rows.length === 0) return <div>No CSV data to preview.</div>;

    const hasHeader = rows.length > 1;

    return (
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <Table responsive className="csv-preview-table">
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
        <style>{`
          .csv-preview-table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
          }
          .csv-preview-table thead tr {
            background-color: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .csv-preview-table th,
          .csv-preview-table td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #dee2e6;
            white-space: nowrap;
          }
          .csv-preview-table tbody tr:hover {
            background-color: #f1f3f5;
          }
          .csv-preview-table td {
            color: #343a40;
            font-size: 0.9rem;
          }
          .csv-preview-table th {
            font-weight: 600;
            color: #212529;
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    return (
      <>
        {renderMetadata(previewData.metadata)}

        {previewData.type === "image" ? (
          <div className="text-center">
            <img
              src={previewData.previewUrl}
              alt="File Preview"
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: "400px" }}
            />
          </div>
        ) : previewData.type === "csv" ? (
          renderCsvTable(previewData.previewText)
        ) : (
          <Alert variant="warning">Unsupported file type.</Alert>
        )}
      </>
    );
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

      <Modal.Body style={{ minHeight: "250px" }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
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
