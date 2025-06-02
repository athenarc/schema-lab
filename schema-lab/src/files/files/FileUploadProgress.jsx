import { Row, Col, Button, ProgressBar } from "react-bootstrap";

export default function FileUploadProgress({
  uploading,
  selectedFile,
  uploadError,
  uploadSuccess,
  setUploadError,
  setSelectedFile,
  setUploadSuccess,
  uploadProgress,
  isOverwrite,
  cancelUpload,
  startUpload,
}) {
  return (
    <>
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
    </>
  );
}
