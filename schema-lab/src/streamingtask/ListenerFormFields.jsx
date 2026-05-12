import React from "react";
import { Card, Form, Row, Col } from "react-bootstrap";

function validateUrl(value) {
  try {
    new URL(value);
    return null; // No validation errors
  } catch (e) {
    return "Please enter a valid URL";
  }
}

function tokenInputValidation(props) {
  // This function validates
  // 1) that a token is JWT-like (three parts separated by dots)
  // 2) that the token is not empty
  // 3) has not expired (if it is JWT and has an exp field)
  // 4) has the correct format (if it is JWT, it should be base64url encoded)
  const token = props.value;
  const parts = token.split(".");
  if (parts.length !== 3) {
    return "Token should be in JWT format (three parts separated by dots)";
  }

  if (token.trim() === "") {
    return "Token cannot be empty";
  }

  try {
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return "Token has expired";
    }
  } catch (e) {
    return "Token should be a valid JWT (base64url encoded)";
  }

  return null; // No validation errors
}

export default function ListenerFormFields({
  listener,
  handleListenerChange,
  activeKey,
}) {
  return (
    <Card className="border-0 shadow-sm rounded-3 mb-4">
      <Card.Header className={`bg-primary text-white py-3 `}>
        Configure Listener Service
      </Card.Header>
      <Card.Body>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Name
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="name"
              value={listener?.name}
              onChange={handleListenerChange}
              placeholder="Type name..."
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Description
          </Form.Label>
          <Col sm="9">
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={listener?.description}
              onChange={handleListenerChange}
              placeholder="Enter a detailed description..."
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Streaming Database <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Select
              name="listenerDatabase"
              value={listener?.listenerDatabase || ""}
              onChange={handleListenerChange}
              disabled
              required
            >
              <option value="" disabled>
                Select a streaming database...
              </option>
              <option value="influxdb">InfluxDB</option>
            </Form.Select>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Base Reading URL <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="baseReadingUrl"
              value={listener?.baseReadingUrl}
              onChange={handleListenerChange}
              placeholder="e.g. http://localhost:8086"
              required
            />
          </Col>
        </Form.Group>
        {/* Additional fields for writing URL, token, organization, etc. can be added here */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Base Writing URL <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="baseWritingUrl"
              value={listener?.baseWritingUrl}
              onChange={handleListenerChange}
              placeholder="e.g. http://localhost:8086"
              required
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Token <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="token"
              value={listener?.token}
              onChange={handleListenerChange}
              placeholder="Enter your authentication token..."
              required
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Organization <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="organization"
              value={listener?.organization}
              onChange={handleListenerChange}
              placeholder="Enter your organization name..."
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Department <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="department"
              value={listener?.department}
              onChange={handleListenerChange}
              placeholder="Enter your department name..."
              required
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Entity
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="entity"
              value={listener?.entity}
              onChange={handleListenerChange}
              placeholder="Enter the entity name..."
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Metric <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="text"
              name="metric"
              value={listener?.metric}
              onChange={handleListenerChange}
              placeholder="Enter the metric name..."
              required
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="3" className="fw-bold">
            Reading Frequency (seconds) <span className="text-danger">*</span>
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="number"
              name="frequency"
              value={listener?.frequency}
              onChange={handleListenerChange}
              placeholder="Enter reading frequency in seconds..."
              min={1}
            />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
