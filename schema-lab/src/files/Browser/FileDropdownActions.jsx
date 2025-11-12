import { Button, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faEllipsisVertical,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useState } from "react";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import FileEditModal from "../modals/FileEdit";
import { deleteFile } from "../../api/v1/files";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";
import { isPreviewableFile } from "../utils/files";
import FilePreviewModal from "../modals/FilePreview";

export function FileDropdownActions({
  onRename,
  file,
  handleRefreshFiles,
  handleSetStatus,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFileEditModal, setShowFileEditModal] = useState(false);
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
  const isPreviewable = isPreviewableFile(file?.path);

  const { userDetails } = useContext(UserDetailsContext);

  const handleConfirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleFileEdit = () => {
    setShowFileEditModal(true);
  };

  const handleDelete = useCallback(
    async (file) => {
      setLoading(true);
      handleSetStatus({
        message: "Deleting file...",
        statusType: "info",
        status: 0,
      });
      // setDeleteError("");
      // setDeleteSuccess(false);
      try {
        await deleteFile({
          auth: userDetails?.apiKey,
          path: file?.path,
        });

        // setDeleteSuccess(true);
      } catch (err) {
        handleSetStatus({
          message: "Error deleting file.",
          statusType: "error",
          status: err?.status || 500,
        });
        // setDeleteError(err?.message || "Delete failed");
      } finally {
        handleSetStatus({
          message: "File deleted successfully.",
          statusType: "success",
          status: 200,
        });
        handleRefreshFiles();
        setLoading(false);
        setShowDeleteModal(false);
      }
    },
    [handleRefreshFiles, userDetails?.apiKey, handleSetStatus]
  );

  const handleUpdateSuccess = () => {
    handleSetStatus({
      message: "File renamed successfully.",
      statusType: "success",
      status: 200,
    });
    handleRefreshFiles();
    setShowFileEditModal(false);
  };

  const handleFilePreview = useCallback((file) => {
    setShowFilePreviewModal(true);
  }, []);

  return (
    <Dropdown
      onClick={(e) => e.stopPropagation()}
      align="end"
      style={{ pointer: "cursor" }}
    >
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        file={file}
      />
      <FileEditModal
        show={showFileEditModal}
        onClose={() => setShowFileEditModal(false)}
        file={file}
        onUpdateSuccess={handleUpdateSuccess}
        userDetails={userDetails?.apiKey}
      />
      <FilePreviewModal
        show={showFilePreviewModal}
        onClose={() => setShowFilePreviewModal(false)}
        file={file}
        userDetails={userDetails?.apiKey}
      />
      <Dropdown.Toggle
        variant="link"
        bsPrefix="p-0 border-0 bg-transparent"
        style={{ color: "#6c757d" }}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleFileEdit(file)} disabled={loading}>
          <FontAwesomeIcon icon={faPen} className="me-2" />
          Rename
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => handleConfirmDelete(file)}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
          Delete
        </Dropdown.Item>
        <OverlayTrigger
          placement="bottom"
          overlay={
            !isPreviewable ? (
              <Tooltip id={`tooltip-disabled-${file.path}`}>
                Preview available only for images or CSV files.
              </Tooltip>
            ) : (
              <></>
            )
          }
        >
          <Dropdown.Item
            as="button"
            disabled={!isPreviewable}
            onClick={() => handleFilePreview(file)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Preview
          </Dropdown.Item>
        </OverlayTrigger>
      </Dropdown.Menu>
    </Dropdown>
  );
}
