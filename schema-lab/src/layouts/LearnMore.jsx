import React from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';


const LearnMore = () => {

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <h1>What is HYPATIA lab?</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            <strong>HYPATIA lab</strong> is a pre-release version of <a href="https://github.com/athenarc/schema-lab" className='primary'>SCHEMA lab</a>, currently available only to users of the HYPATIA platform. Full integration with SCHEMA lab's open-source capabilities is coming soon.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>Key features currently supported:</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <ListGroup variant="flush">
            <ListGroup.Item className="border-0 text-muted">
              <strong>Task & Workflow Management</strong>
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Submit and Run Tasks & Workflows:</strong> Easily submit and run computational tasks.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Track Task & Workflow Status:</strong> Stay informed with clear status indicators showing whether tasks are submitted, running, completed, or have encountered errors.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Manage with Ease:</strong> Cancel tasks & workflows with just a click, ensuring flexibility and control over your computational workflows.
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <ListGroup variant="flush">
            <ListGroup.Item className="border-0 text-muted">
              <strong>Computational Experiments</strong>
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
            This interface provides a streamlined experience for creating and managing computational experiments.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Create Experiments:</strong> Combine one or more tasks into a computational experiment. 
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Manage Tasks:</strong> Easily select and group tasks using checkboxes. 
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>View Details:</strong> Access detailed information about each task and experiment.
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h1>Quick start</h1>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <p>How to connect and use HYPATIA lab:</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <ListGroup variant="flush">
            <ListGroup.Item className="border-0 text-muted">
              <strong>Access HYPATIA lab:</strong> Log in to the <a href="https://hypatia.athenarc.gr/" className='primary'>HYPATIA</a> with your credentials.
              Navigate to the Dashboard and click "Access" next to your active on demand batch computation project.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Generate API Key:</strong> In the "Approved Resources" section, select "API tokens management."
              Generate an API key by following the instructions provided. This API key will allow you to connect to HYPATIA lab.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong> Connect to HYPATIA lab:</strong> Visit the HYPATIA lab platform and log in using the API key you generated.
              Once logged in, you can start submitting and monitoring your computational tasks directly through the HYPATIA lab interface.
            </ListGroup.Item>
            <ListGroup.Item className="border-0 text-muted">
              <strong>Submit and Monitor Tasks:</strong> Use the "Run a Task" feature to submit new tasks.
              Monitor your task status using the "Dashboard" and make any necessary adjustments, such as canceling tasks.
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <p>
            Open-source code for SCHEMA lab is available here: <a href="https://github.com/athenarc/schema-lab" target="_blank" rel="noopener noreferrer" className='primary'>SCHEMA lab</a>
          </p>
        </Col>
      </Row>

    </Container>
  );
};

export default LearnMore;