import React from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';


const LearnMore = () => {

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <h1>What is SCHEMA lab?</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            SCHEMA Lab is an open-source platform developed to assist researchers and scientists in managing and executing computational tasks efficiently. The platform specializes in submitting and monitoring containerized task execution requests, providing a seamless environment for your computational needs.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>The key features currently supported:</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <ListGroup variant="flush">
            <ListGroup.Item className="border-0 text-muted">
              <strong>Task Management</strong>
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Submit and Run Tasks:</strong> Easily submit and run computational tasks.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Track Task Status:</strong> Stay informed with clear status indicators showing whether tasks are submitted, running, completed, or have encountered errors.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Manage with Ease:</strong> Cancel tasks with just a click, ensuring flexibility and control over your computational workflows.
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <p>
            Open-source code for SCHEMA lab is available here: <a href="https://github.com/athenarc/schema-lab" target="_blank" rel="noopener noreferrer" className='text-dark'>SCHEMA lab</a>
          </p>
        </Col>
      </Row>

    </Container>
  );
};

export default LearnMore;