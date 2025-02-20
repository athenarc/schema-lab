import React, { useRef } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
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
        <Row className="mt-3 align-items-center">
            <Col>
                <div className="bg-light py-2 px-3 rounded">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="d-inline mb-0">
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="ms-2" /> 
                            &nbsp;Select Tasks and click <b>Create</b> to submit Experiment:
                        </h6>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="button-tooltip">Select at least one task to create an experiment</Tooltip>}
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
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default TasksFilterControls;
