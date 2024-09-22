import React, { createContext, useContext, useEffect, useState } from "react";
import CreateExperiment from "./CreateExperiment";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Container } from "react-bootstrap";
import { UserDetailsContext } from "../../../utils/components/auth/AuthProvider";
import { getProjectName } from "../../../api/v1/actions";

 
const Experiment = () => {
    const { userDetails } = useContext(UserDetailsContext); // Ensure this context provides `userDetails`
    const [projectName, setProjectName] = useState(null);

    useEffect(() => {
        if (userDetails && userDetails.apiKey) {
            getProjectName(userDetails.apiKey)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    setProjectName(data.name || 'No project name available');
                });
        }
    }, [userDetails]);

    return (
        <div className="d-flex flex-column min-vh-100">
        <Container className="flex-grow-1">
            <Row>
                <Col>
                    <h1 className="display-6 mb-4">Setup an Experiment</h1>
                    <p className="display-7">
      Submit task for project: <strong>{projectName}</strong>.
    </p>
                    <Container>
                            <CreateExperiment />
                    </Container>
                </Col>
            </Row>
        </Container>
    </div>
    );
};

export default Experiment;


