import React, { useState, useContext } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { Tooltip, OverlayTrigger, Dropdown, DropdownButton, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { faArrowDownAZ, faArrowDownZA } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Table from "react-bootstrap/Table";
import { useTaskData, useTaskFilters } from "../../TasksListProvider";
import { cloneDeep } from "lodash";
import TaskStatus from "../../TaskStatus";
import { cancelTaskPost, cancelWorkflowTaskPost } from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";

const ExperimentTaskListing = ({ uuid, status, submitted_at, updated_at, isSelected, toggleSelection }) => {
    const handleCheckboxChange = () => toggleSelection(uuid);

    return (
        <tr className={isSelected ? 'table-active' : ''}>
            <td>
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="checkbox-tooltip">Select a task to be added in the experiment</Tooltip>}
                    trigger={['hover', 'focus']}
                >
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                    />
                </OverlayTrigger>
            </td>
            <td><Link to={`/task-details/${uuid}/executors`}>{uuid}</Link></td>
            <td><TaskStatus status={status} /></td>
            <td>{new Date(submitted_at).toLocaleString('en')}</td>
            <td>{new Date(updated_at).toLocaleString('en')}</td>
        </tr>
    );
};

const ColumnOrderToggle = ({ columnName, currentOrder, setOrder }) => {
    const active = currentOrder && currentOrder.endsWith(columnName);
    const asc = currentOrder && !currentOrder.startsWith("-");
    const icon = active && !asc ? faArrowDownZA : faArrowDownAZ;

    const handleSwitchOrder = () => setOrder(active && asc ? `-${columnName}` : columnName);

    return (
        <span role="button" className={"fw-bold" + (active ? " text-primary" : " text-muted")} onClick={handleSwitchOrder}>
            <FontAwesomeIcon icon={icon} />
        </span>
    );
};

const ExperimentTaskList = () => {
    const [showWorkflowTasks, setShowWorkflowTasks] = useState(false);
    const { taskData } = useTaskData(showWorkflowTasks);
    const { taskFilters, setTaskFilters, selectedTasks, setSelectedTasks } = useTaskFilters();
    const [token, setToken] = useState(taskFilters.token);
    const [statuses, setStatuses] = useState({ ...taskFilters.statuses });
    const [typedChar, setTypedChar] = useState();
    const [showValidationMessage, setShowValidationMessage] = useState(false);

    const minCharThreshold = 2;
    const orderBy = taskFilters.order;

    const setOrderBy = (attribute) => {
        const newFilters = cloneDeep(taskFilters);
        newFilters.order = attribute;
        setTaskFilters(newFilters);
    };

    const handleNameInput = (evt) => setToken(evt.target.value);
    const restoreFilters = (evt) => {
        setShowValidationMessage(false);
        if (evt.key !== 'Enter') setTypedChar(evt.target.value.length);
        if (evt.target.value === "") setTaskFilters({ ...taskFilters, token: "", statuses: {} });
    };
    const handleApplyFilters = (event) => {
        if (event.key === 'Enter') {
            if (typedChar >= minCharThreshold) {
                setTaskFilters({ ...taskFilters, token, statuses, page: 0 });
                setShowValidationMessage(false);
            } else setShowValidationMessage(true);
        }
    };
    const handleStatusChange = (status) => {
        const newStatuses = status !== 'all' ? { [status]: status } : {};
        setStatuses(newStatuses);
        setTaskFilters({ ...taskFilters, token, statuses: newStatuses });
    };

    const toggleRowSelection = (task) => {
    const type = showWorkflowTasks ? "workflow" : "task";

    const exists = selectedTasks.some(
        (t) => t.uuid === task.uuid && t.type === type
    );

    if (exists) {
        setSelectedTasks(selectedTasks.filter(t =>
            !(t.uuid === task.uuid && t.type === type)
        ));
    } else {
        setSelectedTasks([...selectedTasks, { ...task, type }]);
    }
};


    const handleSelectAll = (event) => {
    const type = showWorkflowTasks ? "workflow" : "task";

    if (event.target.checked && taskData?.results) {
        setSelectedTasks([
            ...selectedTasks.filter(t => t.type !== type),
            ...taskData.results.map(t => ({ ...t, type }))
        ]);
    } else {
        setSelectedTasks(selectedTasks.filter(t => t.type !== type));
    }
};

    const findFilteredTokens = () => {
        if (taskData?.count === 0) return (
            <div className="alert alert-warning text-center">Your search <b>{token}</b> did not match any task!</div>
        );
        return null;
    };

    return (
        <Row className="p-3 mb-5">
            <Col className="align-items-center">
                {/* Tabs to toggle single/workflow */}
                <Tabs
                    id="experiment-task-tabs"
                    activeKey={showWorkflowTasks ? 'workflow' : 'tasks'}
                    onSelect={(key) => setShowWorkflowTasks(key === 'workflow')}
                    className="mb-3 fw-bold"
                >
                    <Tab eventKey="tasks" title="Single Tasks" />
                    <Tab eventKey="workflow" title="Workflow Tasks" />
                </Tabs>

                {taskData?.results && (
                    <Table borderless responsive hover>
                        <thead>
                            <tr>
                                <th>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip id="checkbox-tooltip">Select all tasks to be added in the experiment</Tooltip>}
                                        trigger={['hover', 'focus']}
                                    >
                                        <input className="form-check-input" type="checkbox" onChange={handleSelectAll} />
                                    </OverlayTrigger>
                                </th>
                                <th className="col-4">
                                    <div className="input-group">
                                        <span className="input-group-text fw-bold">
                                            Name/UUID&nbsp;
                                            <ColumnOrderToggle columnName="uuid" currentOrder={orderBy} setOrder={setOrderBy} />
                                        </span>
                                        <OverlayTrigger
                                            placement="bottom"
                                            show={showValidationMessage}
                                            overlay={<Tooltip id="tooltip-right">Please type at least two characters!</Tooltip>}
                                        >
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search..."
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
                                    >
                                        <Dropdown.Item eventKey='all'><TaskStatus status='ALL' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='submitted'><TaskStatus status='SUBMITTED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='approved'><TaskStatus status='APPROVED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='scheduled'><TaskStatus status='SCHEDULED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='running'><TaskStatus status='RUNNING' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='completed'><TaskStatus status='COMPLETED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='error'><TaskStatus status='ERROR' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='canceled'><TaskStatus status='CANCELED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='rejected'><TaskStatus status='REJECTED' /></Dropdown.Item>
                                    </DropdownButton>
                                </th>
                                <th>Submission <ColumnOrderToggle columnName="submitted_at" currentOrder={orderBy} setOrder={setOrderBy} /></th>
                                <th>Last Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskData.results.map(task => (
                                <ExperimentTaskListing
                                    key={task.uuid}
                                    uuid={task.uuid}
                                    status={task.current_status.status}
                                    submitted_at={task.submitted_at}
                                    updated_at={task.current_status.updated_at}
                                    // isSelected={selectedTasks.some(t => t.uuid === task.uuid)}
                                    isSelected={selectedTasks.some(
                                        (t) =>
                                            t.uuid === task.uuid &&
                                            t.type === (showWorkflowTasks ? "workflow" : "task")
                                    )}
                                    toggleSelection={() => toggleRowSelection(task)}
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

export default ExperimentTaskList;