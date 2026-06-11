import React, { useState } from "react";
import { Button, Row, Col, Modal } from "react-bootstrap";
import { FaAngleRight, FaAngleDown } from "react-icons/fa";

export default function ConfirmationModal({
  showModal,
  handleModalClose,
  handleConfirmSubmit,
  listener,
  modelers,
  resources,
}) {
  const [showJson, setShowJson] = useState(false);

  return (
    <Modal show={showModal} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Submit New Task</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Row className="w-100">
          <Col className="text-left">
            <p> Confirm that you want to submit the task?</p>
          </Col>
        </Row>
        <Row className="w-100 justify-content-center">
          <Col xs="auto">
            <Button variant="danger" onClick={handleModalClose}>
              Cancel
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="success" onClick={handleConfirmSubmit}>
              Confirm
            </Button>
          </Col>
        </Row>
      </Modal.Footer>

      <Modal.Body>
        <div
          onClick={() => setShowJson(!showJson)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {showJson ? <FaAngleDown /> : <FaAngleRight />}
          <span style={{ marginLeft: "8px" }}>Preview JSON</span>
        </div>

        {showJson && (
          <pre>
            {JSON.stringify(
              {
                streaming: listener.streaming,
                data: { source: { ...listener, modeler: modelers } },
              },
              null,
              2,
            )}
          </pre>
        )}
      </Modal.Body>
    </Modal>
  );
}
