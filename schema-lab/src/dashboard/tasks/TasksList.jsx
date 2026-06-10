import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  Tooltip,
  OverlayTrigger,
  Dropdown,
  DropdownButton,
  Tabs,
  Tab,
} from "react-bootstrap";

import Table from "react-bootstrap/Table";
import { useTaskData, useTaskFilters } from "./TasksListProvider";
import { cloneDeep } from "lodash";
import TaskStatus from "./TaskStatus";
import TaskListing from "./TaskListing";
import ColumnOrderToggle from "./ColumnOrderToggle";

const TaskList = () => {
  const [taskType, setTaskType] = useState("tasks"); // "tasks", "workflow", or "streaming"
  const { taskData } = useTaskData(taskType === "workflow");
  const { taskFilters, setTaskFilters } = useTaskFilters();
  const [token, setToken] = useState(taskFilters.token);
  const [statuses, setStatuses] = useState({ ...taskFilters.statuses });
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
    if (evt.key !== "Enter") {
      setTypedChar(evt.target.value.length);
    }
    if (evt.target.value === "") {
      setTaskFilters({ ...taskFilters, token: "", statuses: {} });
    }
  };

  const handleApplyFilters = (event) => {
    if (event.key === "Enter") {
      if (typedChar >= minCharThreshold) {
        setShowValidationMessage(false);
        setTaskFilters({
          ...taskFilters,
          token,
          statuses: { ...statuses },
          page: 0,
        });
      } else {
        setShowValidationMessage(true);
      }
    }
  };

  const handleStatusChange = (status) => {
    let newStatuses = {};
    if (status !== "all") {
      newStatuses = { [status]: status };
    }
    setStatuses(newStatuses);
    setTaskFilters({
      ...taskFilters,
      token,
      statuses: newStatuses,
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
          activeKey={taskType}
          onSelect={(key) => setTaskType(key)}
          className="mb-3 fw-bold"
        >
          <Tab eventKey="tasks" title="Single Tasks" />
          <Tab eventKey="workflow" title="Workflow Tasks" />
          <Tab eventKey="streaming" title="Streaming Tasks" />
        </Tabs>

        {taskData && taskData.results && (
          <Table borderless responsive hover>
            <thead>
              <tr>
                <th className="col-4">
                  <div className="input-group">
                    <span className="input-group-text fw-bold" id="search">
                      Name/UUID&nbsp;
                      <ColumnOrderToggle
                        columnName={"uuid"}
                        currentOrder={orderBy}
                        setOrder={setOrderBy}
                      />
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
                    variant="light"
                    title={<span className="fw-bold">Status</span>}
                    onSelect={handleStatusChange}
                    drop="auto"
                    renderMenuOnMount
                    container="body"
                  >
                    <Dropdown.Item eventKey="all">
                      <TaskStatus status="ALL" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="submitted">
                      <TaskStatus status="SUBMITTED" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="approved">
                      <TaskStatus status="APPROVED" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="scheduled">
                      <TaskStatus status="SCHEDULED" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="queued">
                      <TaskStatus status="QUEUED" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="running">
                      <TaskStatus status="RUNNING" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="completed">
                      <TaskStatus status="COMPLETED" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="error">
                      <TaskStatus status="ERROR" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="canceled">
                      <TaskStatus status="CANCELED" />
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="rejected">
                      <TaskStatus status="REJECTED" />
                    </Dropdown.Item>
                  </DropdownButton>
                </th>
                <th>
                  Submission{" "}
                  <ColumnOrderToggle
                    columnName={"submitted_at"}
                    currentOrder={orderBy}
                    setOrder={setOrderBy}
                  />
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
                  taskType={taskType}
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
