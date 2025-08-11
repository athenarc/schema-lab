import React, { useRef } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { useTaskFilters } from "../../TasksListProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { faArrowAltCircleRight } from "@fortawesome/free-regular-svg-icons";

const TasksFilterControls = () => {
    const { selectedTasks } = useTaskFilters();
    const navigate = useNavigate();
    const elementRef = useRef(null);

    const handleCreateExperiment = () => {
        navigate("/create", { state: { selectedTasks } });
    };

    return (
        <Card className="shadow-sm mt-3">
            <Card.Header as="h6" className="fw-semibold">
                <FontAwesomeIcon
                    icon={faArrowAltCircleRight}
                    className="me-2 text-primary"
                />
                Create Experiment
            </Card.Header>
            <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                    <small className="text-muted">
                        Select a <b>Completed</b> task or workflow. Then, click <b>Create</b> to submit your experiment.
                    </small>
                </div>

                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id="button-tooltip">
                            Select at least one task to create an experiment
                        </Tooltip>
                    }
                >
                    <div>
                        <Button
                            ref={elementRef}
                            onClick={handleCreateExperiment}
                            variant="outline-primary"
                            disabled={selectedTasks.length === 0}
                            className="ms-auto"
                        >
                            Create
                        </Button>
                    </div>
                </OverlayTrigger>
            </Card.Body>
        </Card>
    );
};

export default TasksFilterControls;
