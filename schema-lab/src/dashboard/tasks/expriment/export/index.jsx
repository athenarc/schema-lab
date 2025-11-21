import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Container } from "react-bootstrap";
import ExportExp from "./ExperimentExport"; // your ExportExp component

const ExportExperiment = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="flex-grow-1">
        <Row>
          <Col>
           <h1 className="display-6">Export Ro-Crate</h1>
            <Container>
              <ExportExp />
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ExportExperiment;
