import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import TasksFilterControls from "./TasksFilterControls";
import TasksListProvider from "../../TasksListProvider";
import TasksPaginationControls from "../../TasksPaginationControls";
import ExperimentTaskList from "./TasksList";


const Experiment = ({ taskDetails }) => {
    return (
        <Row>
            <Col>
                {/* Render only completed tasks */}
                <TasksListProvider initialTasks={taskDetails}
                        initialFilters={{ statuses: { completed: 'completed' } }}>
                    <TasksFilterControls />
                    <TasksPaginationControls />
                    <Row className="p-3 mb-5">
                        <Col>
                           <ExperimentTaskList />
                        </Col>
                    </Row>
                </TasksListProvider>
            </Col>
        </Row>
    );
};

export default Experiment;