import { Modal, Button } from "react-bootstrap";

const FilePreviewModal = ({ show, onClose, userDetails }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-primary text-white" closeButton>
        <Modal.Title>Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body className="m-auto p-4"></Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilePreviewModal;
