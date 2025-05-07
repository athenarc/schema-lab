import { Container, Row, Col } from "react-bootstrap";

const timestampToDateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FilesList = ({ files }) => {
  return (
    <Container fluid className="py-3">
      {/* Header only on medium and up */}
      <Row className="fw-bold border-bottom pb-2 mb-2 d-none d-md-flex">
        <Col md={6}>File Name</Col>
        <Col md={1}>Size</Col>
        <Col md={3}>Modified</Col>
        <Col md={2}>Actions</Col>
      </Row>

      {files.map((file, index) => (
        <Row
          key={index}
          className="border rounded p-2 mb-3 flex-column flex-md-row gx-3"
        >
          <Col xs={12} md={6} className="text-truncate">
            <div className="fw-bold d-md-none">File Name</div>
            {file?.path}
          </Col>
          <Col xs={12} md={1}>
            <div className="fw-bold d-md-none">Size</div>
            {formatBytes(file?.metadata?.size)}
          </Col>
          <Col xs={12} md={3}>
            <div className="fw-bold d-md-none">Modified</div>
            {new Date(file?.metadata?.ts_modified).toLocaleDateString(
              undefined,
              timestampToDateOptions
            )}
          </Col>
          <Col xs={12} md={2}>
            <div className="fw-bold d-md-none">Actions</div>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default FilesList;
