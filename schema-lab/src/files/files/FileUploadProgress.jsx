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
  unzipError,
  setUnzipError,
  unzipSuccess,
  setUnzipSuccess,
}) {
  return (
    <>
      {uploading && (
        <Row className="align-items-center mt-3">
          <Col md={10}>
            <ProgressBar
              now={uploadProgress}
              label={`${Math.round(uploadProgress)}%`}
              animated
              striped
              style={{ height: "1.5rem", fontSize: "0.9rem" }}
            />
            {isOverwrite && selectedFile && (
              <div
                className="alert alert-warning mt-3 p-2"
                style={{ fontSize: "0.9rem" }}
              >
                ⚠️ Uploading <strong>{selectedFile.name}</strong> will overwrite
                an existing file with the same name.
              </div>
            )}
          </Col>
          <Col md={2} className="text-center">
            <Button variant="outline-danger" size="sm" onClick={cancelUpload}>
              Cancel
            </Button>
          </Col>
        </Row>
      )}

      {uploadError && (
        <Row className="mt-3">
          <Col>
            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0 px-3 py-2">
              <span style={{ fontSize: "0.9rem" }}>{uploadError}</span>
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
                  ×
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}
      {unzipError && (
        <Row className="mt-3">
          <Col>
            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0 px-3 py-2">
              <span style={{ fontSize: "0.9rem" }}>{unzipError}</span>
              <div>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => {
                    setUnzipError("");
                    setSelectedFile(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {(uploadSuccess || unzipSuccess) && (
        <Row className="mt-3">
          <Col>
            <div className="alert alert-success d-flex justify-content-between align-items-center mb-0 px-3 py-2">
              <span style={{ fontSize: "0.9rem" }}>
                {uploadSuccess && "File uploaded successfully!"}
                {unzipSuccess && "File unzipped successfully!"}
              </span>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => {
                  setUploadSuccess(false);
                  setUnzipSuccess(false);
                  setSelectedFile(null);
                }}
              >
                ×
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
}
