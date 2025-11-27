import {
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faEllipsisVertical,
  faMagnifyingGlass,
  faFileDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useState } from "react";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import FileEditModal from "../modals/FileEdit";
import { deleteFile, downloadFile } from "../../api/v1/files";
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

  const handleConfirmDelete = () => setShowDeleteModal(true);
  const handleFileEdit = () => setShowFileEditModal(true);

  const handleDelete = useCallback(
    async (file) => {
      setLoading(true);
      handleSetStatus({
        message: "Deleting file...",
        statusType: "info",
        status: 0,
      });
      try {
        await deleteFile({ auth: userDetails?.apiKey, path: file?.path });
        handleSetStatus({
          message: "File deleted successfully.",
          statusType: "success",
          status: 200,
        });
      } catch (err) {
        handleSetStatus({
          message: "Error deleting file.",
          statusType: "error",
          status: err?.status || 500,
        });
      } finally {
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

  const handleFilePreview = useCallback(
    () => setShowFilePreviewModal(true),
    []
  );

  return (
    <>
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

      <Dropdown align="end" onClick={(e) => e.stopPropagation()}>
        <Dropdown.Toggle
          variant="link"
          bsPrefix="p-0 border-0 bg-transparent"
          style={{ color: "#6c757d", cursor: "pointer" }}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {[
            {
              icon: faMagnifyingGlass,
              label: "Preview",
              onClick: handleFilePreview,
              disabled: !isPreviewable,
              tooltip: !isPreviewable
                ? "Preview available only for images or CSV files."
                : "",
            },
            {
              icon: faFileDownload,
              label: "Download",
              onClick: () =>
                downloadFile({ auth: userDetails?.apiKey, path: file?.path }),
            },
            {
              icon: faPen,
              label: "Rename",
              onClick: handleFileEdit,
              loading: loading,
            },
            {
              icon: faTrash,
              label: "Delete",
              onClick: handleConfirmDelete,
              loading: loading,
              className: "text-danger",
            },
          ].map((item) => {
            const content = (
              <>
                {item?.loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className={`me-2 ${item?.className || ""}`}
                    style={{ verticalAlign: "middle" }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={item?.icon}
                    className={`me-2 ${item?.className || ""}`}
                    style={{ width: "1em", textAlign: "center" }}
                  />
                )}
                {item?.label}
              </>
            );

            const dropdownItem = (
              <Dropdown.Item
                key={item?.label}
                onClick={item?.onClick}
                disabled={item?.disabled || item?.loading}
                className={item?.className || ""}
                style={{ display: "flex", alignItems: "center" }}
              >
                {content}
              </Dropdown.Item>
            );

            return item?.tooltip && item?.disabled ? (
              <OverlayTrigger
                key={item?.label}
                placement="bottom"
                overlay={
                  <Tooltip id={`tooltip-${item?.label}`}>
                    {item?.tooltip}
                  </Tooltip>
                }
              >
                {dropdownItem}
              </OverlayTrigger>
            ) : (
              dropdownItem
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
