import React from "react";
import { Card, Form, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";

export default function ModelerFormFields({ modelers, handleModelerChange }) {
  return (
    <div>
      {modelers.map((modeler, index) => (
        <Card className="border-0 shadow-sm rounded-3 mb-4" key={index}>
          <Card.Header className={`bg-primary text-white py-3`}>
            Modeler Information
          </Card.Header>
          <Card.Body>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Image <span className="text-danger">*</span>
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="image"
                  value={modeler.image}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type image path..."
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Command <span className="text-danger">*</span>
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="command"
                  value={modeler.command.join(" ")}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type command..."
                  required
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Port <span className="text-danger">*</span>
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="port"
                  value={modeler.port || ""}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type port number..."
                  required
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Endpoint <span className="text-danger">*</span>
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="endpoint"
                  value={modeler.endpoint || ""}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type endpoint (default = /model)..."
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Working Directory
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="workdir"
                  value={modeler.workdir}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type working directory..."
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Stdout
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="stdout"
                  value={modeler.stdout}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type stdout..."
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Stderr
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  name="stderr"
                  value={modeler.stderr}
                  onChange={(e) => handleModelerChange(index, e)}
                  placeholder="Type stderr..."
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" className="fw-bold">
                Env
              </Form.Label>
              <Col sm="9">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-env`}>
                      Please type key:value pairs with the following format:
                      KEY1:VALUE1, KEY2:VALUE2 seperated with comma
                    </Tooltip>
                  }
                >
                  <Form.Control
                    type="text"
                    name="env"
                    value={Object.entries(modeler.env)
                      .map(([key, val]) => `${key}:${val}`)
                      .join(", ")}
                    onChange={(e) => handleModelerChange(index, e)}
                    placeholder="Type environmental vars..."
                  />
                </OverlayTrigger>
              </Col>
            </Form.Group>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
