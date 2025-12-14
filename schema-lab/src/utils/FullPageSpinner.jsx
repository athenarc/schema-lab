import { Spinner, Container, Row, Col } from "react-bootstrap";

const FullPageSpinner = () => {
  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center">
      <Row>
        <Col className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
        </Col>
      </Row>
    </Container>
  );
};

export default FullPageSpinner;
