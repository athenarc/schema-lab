import React, { useState, useContext } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, OverlayTrigger, Dropdown, DropdownButton, Button, Alert, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { faArrowDownAZ, faArrowDownZA, faXmark, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Table from "react-bootstrap/Table";
import { useTaskData, useTaskFilters } from "./TasksListProvider";
import { cloneDeep } from "lodash";
import TaskStatus from "./TaskStatus";
import { cancelTaskPost, cancelWorkflowTaskPost, retrieveTaskDetails, retrieveWorkflowTaskDetails } from "../../api/v1/actions";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";

const TaskListing = ({ uuid, status, submitted_at, updated_at, isSelected, toggleSelection, showWorkflowTasks }) => {
    const { userDetails } = useContext(UserDetailsContext);
    const [alertMessage, setAlertMessage] = useState(null);
    const [isAlertActive, setIsAlertActive] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null); 

    const handleCheckboxChange = () => {
        toggleSelection(uuid);
    };

    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const confirmCancelTask = () => {
        // Execute the cancel task only when confirmed
        handleCancelTask(uuid, userDetails.apiKey, showWorkflowTasks);
        setShowCancelConfirmation(false); // Close the modal after confirmation
    };


    const handleCancelTask = (taskUUID, auth, showWorkflowTasks) => {
        const cancelTask = showWorkflowTasks ? cancelWorkflowTaskPost : cancelTaskPost;
        cancelTask({ taskUUID, auth })
            .then(response => {
                if (!response.ok) {
                    setAlertMessage(<span>Canceling <strong>{taskUUID}</strong> task failed! Please try again.</span>);
                    setIsAlertActive(true);
                    setTimeout(() => {
                        setAlertMessage(null);
                        setIsAlertActive(false);
                    }, 3000);
                }
            })
            .catch((error) => {
                setAlertMessage(<span>Canceling <strong>{taskUUID}</strong> task failed! Please try again.</span>);
                setIsAlertActive(true);
                setTimeout(() => {
                    setAlertMessage(null);
                    setIsAlertActive(false);
                }, 3000);
            });
    };

    const handleRerunButtonClick = async () => {
        try {
            // Use different API call based on showWorkflowTasks state
            const response = showWorkflowTasks 
                ? await retrieveWorkflowTaskDetails({
                    taskUUID: uuid,
                    auth: userDetails.apiKey
                  })
                : await retrieveTaskDetails({
                    taskUUID: uuid,
                    auth: userDetails.apiKey
                  });
                
            if (!response.ok) {
                throw new Error(`Error network response.. Status: ${response.status}, Status Text: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Navigate to different path based on showWorkflowTasks state
            showWorkflowTasks
                ? navigate('/runworkflowtask', { state: { taskworkflowdata: data } })
                : navigate('/runtask', { state: { taskData: data } });
        } catch (error) {
            setError(error.toString());
        }
    };

    const nonCancelableStatuses = ["COMPLETED", "ERROR", "CANCELED", "REJECTED"];
    const canCancel = !nonCancelableStatuses.includes(status.toUpperCase());
    // Handle runnable tasks
    const rerunnableStatuses = ["COMPLETED", "ERROR", "CANCELED", "REJECTED"];
    const nonRerunnableStatuses = ["SUBMITTED", "APPROVED", "RUNNING"];
    const canRerun = rerunnableStatuses.includes(status.toUpperCase());
    const cannotRerun = nonRerunnableStatuses.includes(status.toUpperCase());

    return (
        <>
            {isAlertActive ? (
                <tr>
                    <td colSpan="5">
                        <Alert variant="danger" dismissible>
                            {alertMessage}
                        </Alert>
                    </td>
                </tr>
            ) : (
                <tr className={isSelected ? 'table-active' : ''}>
                    <td><Link to={`/task-details/${uuid}/executors`}state={{ from: 'tasks' }}>{uuid}</Link></td>
                    <td><TaskStatus status={status} /></td>
                    <td>{new Date(submitted_at).toLocaleString('en')}</td>
                    <td>{new Date(updated_at).toLocaleString('en')}</td>
                    <td>
                        {canCancel && (
                            <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="cancel-tooltip">Cancel</Tooltip>}
                            >
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setShowCancelConfirmation(true)}
                                    className="cancel-button"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </Button>
                            </OverlayTrigger>
                        )}

                        <OverlayTrigger
                            placement="bottom"
                            overlay={
                                <Tooltip id="retry-tooltip">
                                    {canRerun ? "Rerun" : "Rerun not available for this status"}
                                </Tooltip>
                            }
                        >
                            <span className="d-inline-block">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={canRerun ? handleRerunButtonClick : undefined}
                                    className="retry-button ms-2"
                                    disabled={cannotRerun}
                                    style={cannotRerun ? { pointerEvents: "none" } : {}}
                                >
                                    <FontAwesomeIcon icon={faArrowRotateRight} />
                                </Button>
                            </span>
                        </OverlayTrigger>
                    </td>
                </tr>
            )}

            {/* Cancel Confirmation Modal */}
            <Modal
                show={showCancelConfirmation}
                onHide={() => setShowCancelConfirmation(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Cancellation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to cancel this task?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => setShowCancelConfirmation(false)}
                    >
                        No
                    </Button>
                    <Button variant="success" onClick={confirmCancelTask}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const ColumnOrderToggle = ({ columnName, currentOrder, setOrder }) => {
    const active = currentOrder && currentOrder.endsWith(columnName);
    const asc = currentOrder && !currentOrder.startsWith("-");
    const icon = active && !asc ? faArrowDownZA : faArrowDownAZ;

    const handleSwitchOrder = () => {
        if (active && asc) {
            setOrder(`-${columnName}`);
        } else {
            setOrder(columnName);
        }
    };

    return (
        <span
            role="button"
            className={"fw-bold" + (active ? " text-primary" : " text-muted")}
            onClick={handleSwitchOrder}
        >
            <FontAwesomeIcon icon={icon} />
        </span>
    );
};

const TaskList = () => {
    const [showWorkflowTasks, setShowWorkflowTasks] = useState(false);
    const { taskData } = useTaskData(showWorkflowTasks);
    const { taskFilters, setTaskFilters } = useTaskFilters();
    const [token, setToken] = useState(taskFilters.token);
    const [statuses, setStatuses] = useState({ ...(taskFilters.statuses) });
    const [typedChar, setTypedChar] = useState();
    const [showValidationMessage, setShowValidationMessage] = useState(false);

    const minCharThreshold = 2;

    const orderBy = taskFilters.order;
    const setOrderBy = (attribute) => {
        const newTaskFilters = cloneDeep(taskFilters);
        newTaskFilters.order = attribute;
        setTaskFilters(newTaskFilters);
    };

    const handleNameInput = (evt) => {
        setToken(evt.target.value);
    };

    const restoreFilters = (evt) => {
        setShowValidationMessage(false);
        if (evt.key !== 'Enter') {
            setTypedChar(evt.target.value.length);
        }
        if (evt.target.value === "") {
            setTaskFilters({ ...taskFilters, token: "", statuses: {} });
        }
    };

    const handleApplyFilters = (event) => {
        if (event.key === 'Enter') {
            if (typedChar >= minCharThreshold) {
                setShowValidationMessage(false);
                setTaskFilters({
                    ...taskFilters,
                    token,
                    statuses: { ...statuses },
                    page: 0
                });
            } else {
                setShowValidationMessage(true);
            }
        }
    };

    const handleStatusChange = (status) => {
        let newStatuses = {};
        if (status !== 'all') {
            newStatuses = { [status]: status };
        }
        setStatuses(newStatuses);
        setTaskFilters({
            ...taskFilters,
            token,
            statuses: newStatuses 
        });
    };

    const findFilteredTokens = () => {
        if (taskData && taskData.count === 0) {
            return (
                <div className="alert alert-warning text-center" role="alert">
                    Your search <b>{token}</b> did not match any task!
                </div>
            );
        }
        return null;
    };

    return (
        <Row className="p-3 mb-5">
            <Col className="align-items-center">
                <Tabs
                    id="task-tabs"
                    activeKey={showWorkflowTasks ? 'workflow' : 'tasks'}
                    onSelect={(key) => setShowWorkflowTasks(key === 'workflow')}
                    className="mb-3 fw-bold"
                >
                    <Tab eventKey="tasks" title="Single Tasks" />
                    <Tab eventKey="workflow" title="Workflow Tasks" />
                </Tabs>

                {taskData && taskData.results && (
                    <Table borderless responsive hover>
                        <thead>
                            <tr>
                                <th className="col-4">
                                    <div className="input-group">
                                        <span className="input-group-text fw-bold" id="search">
                                            Name/UUID&nbsp;
                                            <ColumnOrderToggle columnName={"uuid"} currentOrder={orderBy} setOrder={setOrderBy} />
                                        </span>
                                        <OverlayTrigger
                                            placement="bottom"
                                            show={showValidationMessage}
                                            overlay={
                                                <Tooltip id="tooltip-right">
                                                    Please type at least two characters!
                                                </Tooltip>
                                            }
                                        >
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search..."
                                                aria-label="search"
                                                aria-describedby="search-box"
                                                value={token}
                                                onInput={handleNameInput}
                                                onKeyDown={handleApplyFilters}
                                                onChange={restoreFilters}
                                            />
                                        </OverlayTrigger>
                                    </div>
                                </th>
                                <th>
                                    <DropdownButton
                                        id="dropdown-basic-button"
                                        variant='light'
                                        title={<span className="fw-bold">Status</span>}
                                        onSelect={handleStatusChange}
                                        drop="auto"
                                        renderMenuOnMount
                                        container="body" 
                                    >
                                        <Dropdown.Item eventKey='all'><TaskStatus status='ALL' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='submitted'><TaskStatus status='SUBMITTED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='approved'><TaskStatus status='APPROVED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='scheduled'><TaskStatus status='SCHEDULED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='queued'><TaskStatus status='QUEUED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='running'><TaskStatus status='RUNNING' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='completed'><TaskStatus status='COMPLETED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='error'><TaskStatus status='ERROR' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='canceled'><TaskStatus status='CANCELED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='rejected'><TaskStatus status='REJECTED' /></Dropdown.Item>
                                    </DropdownButton>
                                </th>
                                <th>
                                    Submission <ColumnOrderToggle columnName={"submitted_at"} currentOrder={orderBy} setOrder={setOrderBy} />
                                </th>
                                <th>Last Update</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskData.results.map((task) => (
                                <TaskListing
                                    key={task.uuid}
                                    uuid={task.uuid}
                                    status={task.current_status.status}
                                    submitted_at={task.submitted_at}
                                    updated_at={task.current_status.updated_at}
                                    showWorkflowTasks={showWorkflowTasks}
                                />
                            ))}
                        </tbody>
                    </Table>
                )}
            </Col>
            {findFilteredTokens()}
        </Row>
    );
};

export default TaskList;

