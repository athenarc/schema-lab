import { useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { unzipFile } from "../../api/v1/files"; // Your API call
import { faFileArchive } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FileUnzipper = ({
  filePath,
  apiKey,
  onUnzipSuccess,
  setUnzipError,
  setUnzipSuccess,
}) => {
  const [unzipping, setUnzipping] = useState(false);

  // Only allow unzip if file ends with .zip
  const canUnzip = filePath?.toLowerCase().endsWith(".zip");

  const handleUnzip = async () => {
    setUnzipError(null);
    setUnzipSuccess(false);
    setUnzipping(true);
    try {
      await unzipFile({
        auth: apiKey,
        zip_path: filePath,
        destination_path: "/",
      });
      setUnzipSuccess(true);
      onUnzipSuccess();
    } catch (err) {
      setUnzipError(err.message || "Failed to unzip file");
    } finally {
      setUnzipping(false);
    }
  };

  if (!canUnzip) return null;

  return (
    <div>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleUnzip}
        disabled={unzipping}
        className="d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: 0 }}
        title="Unzip"
      >
        {unzipping ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <FontAwesomeIcon icon={faFileArchive} />
        )}
      </Button>
    </div>
  );
};

export default FileUnzipper;
