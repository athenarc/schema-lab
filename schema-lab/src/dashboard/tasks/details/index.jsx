import React from "react";
import { useLocation } from "react-router-dom";
import TaskListDetails from "./TaskListDetails";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import TasksListProvider from "../TasksListProvider";
import TasksFilterControls from "../TasksFilterControls";
import { Container } from 'react-bootstrap';

const Details = () => {
    const location = useLocation();
    const isWorkflowTask = (location.state && location.state.isWorkflowTask) || false;

    return (
        <div className="d-flex flex-column min-vh-100">
            <Container className="flex-grow-1">
                <Row>
                    <Col>
                        <h1 className="display-6">
                            {isWorkflowTask ? 'Workflow Details' : 'Task Details'}
                        </h1>
                        <Container>
                            <TasksListProvider>
                                <TasksFilterControls />   
                                <TaskListDetails />
                            </TasksListProvider>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Details;