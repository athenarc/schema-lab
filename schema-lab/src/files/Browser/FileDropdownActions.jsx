import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useState } from "react";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import FileEditModal from "../modals/FileEdit";
import { deleteFile } from "../../api/v1/files";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";

export function FileDropdownActions({ onRename, file, handleRefreshFiles }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showFileEditModal, setShowFileEditModal] = useState(false);

  const { userDetails } = useContext(UserDetailsContext);

  const handleConfirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleFileEdit = () => {
    setShowFileEditModal(true);
  };

  const handleDelete = useCallback(
    async (file) => {
      setDeleteLoading(true);
      setDeleteError("");
      setDeleteSuccess(false);
      try {
        await deleteFile({
          auth: userDetails?.apiKey,
          path: file?.path,
        });

        setDeleteSuccess(true);
      } catch (err) {
        setDeleteError(err?.message || "Delete failed");
      } finally {
        handleRefreshFiles();
        setDeleteLoading(false);
        setShowDeleteModal(false);
      }
    },
    [handleRefreshFiles, userDetails?.apiKey]
  );

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
        onUpdateSuccess={handleRefreshFiles}
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
        <Dropdown.Item
          onClick={() => handleFileEdit(file)}
          disabled={deleteLoading}
        >
          <FontAwesomeIcon icon={faPen} className="me-2" />
          Rename
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => handleConfirmDelete(file)}
          disabled={deleteLoading}
        >
          <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
          Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
