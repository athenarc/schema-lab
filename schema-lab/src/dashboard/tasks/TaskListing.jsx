import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, OverlayTrigger, Button, Alert, Modal } from "react-bootstrap";
import { faXmark, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TaskStatus from "./TaskStatus";
import {
  cancelTaskPost,
  cancelWorkflowTaskPost,
  retrieveTaskDetails,
  retrieveWorkflowTaskDetails,
  cancelStreamingTask,
  retrieveStreamingTaskDetails,
} from "../../api/v1/actions";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";

const TaskListing = ({
  uuid,
  status,
  submitted_at,
  updated_at,
  isSelected,
  toggleSelection,
  taskType,
}) => {
  const { userDetails } = useContext(UserDetailsContext);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const nonCancelableStatuses = ["COMPLETED", "ERROR", "CANCELED", "REJECTED"];
  const canCancel = !nonCancelableStatuses.includes(status.toUpperCase());
  // Handle runnable tasks
  const rerunnableStatuses = ["COMPLETED", "ERROR", "CANCELED", "REJECTED"];
  const nonRerunnableStatuses = ["SUBMITTED", "APPROVED", "RUNNING"];
  const canRerun = rerunnableStatuses.includes(status.toUpperCase());
  const cannotRerun = nonRerunnableStatuses.includes(status.toUpperCase());

  const confirmCancelTask = () => {
    // Execute the cancel task only when confirmed
    handleCancelTask(uuid, userDetails.apiKey, taskType);
    setShowCancelConfirmation(false); // Close the modal after confirmation
  };

  const handleCancelTask = (taskUUID, auth, taskType) => {
    const cancelTask =
      taskType === "workflow"
        ? cancelWorkflowTaskPost
        : taskType === "tasks"
          ? cancelTaskPost
          : cancelStreamingTask;
    cancelTask({ taskUUID, auth })
      .then((response) => {
        if (!response.ok) {
          setAlertMessage(
            <span>
              Canceling <strong>{taskUUID}</strong> task failed! Please try
              again.
            </span>,
          );
          setIsAlertActive(true);
          setTimeout(() => {
            setAlertMessage(null);
            setIsAlertActive(false);
          }, 3000);
        }
      })
      .catch((error) => {
        setAlertMessage(
          <span>
            Canceling <strong>{taskUUID}</strong> task failed! Please try again.
          </span>,
        );
        setIsAlertActive(true);
        setTimeout(() => {
          setAlertMessage(null);
          setIsAlertActive(false);
        }, 3000);
      });
  };

  const handleRerunButtonClick = async () => {
    try {
      // Use different API call based on taskType
      const response =
        taskType === "workflow"
          ? await retrieveWorkflowTaskDetails({
              taskUUID: uuid,
              auth: userDetails.apiKey,
            })
          : taskType === "tasks"
            ? await retrieveTaskDetails({
                taskUUID: uuid,
                auth: userDetails.apiKey,
              })
            : await retrieveStreamingTaskDetails({
                taskUUID: uuid,
                auth: userDetails.apiKey,
              });

      if (!response.ok) {
        throw new Error(
          `Error network response.. Status: ${response.status}, Status Text: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Navigate to different path based on taskType
      taskType === "workflow"
        ? navigate("/runworkflowtask", { state: { taskworkflowdata: data } })
        : taskType === "tasks"
          ? navigate("/runtask", { state: { taskData: data } })
          : navigate("/runstreamingtask", {
              state: { taskStreamingData: data },
            });
    } catch (error) {
      setError(error.toString());
    }
  };

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
        <tr className={isSelected ? "table-active" : ""}>
          <td>
            <Link
              to={`/task-details/${uuid}/executors`}
              state={{
                from: "tasks",
                isWorkflowTask: taskType === "workflow",
                isStreamingTask: taskType === "streaming",
                isTasksTask: taskType === "tasks",
                taskType,
              }}
            >
              {uuid}
            </Link>
          </td>
          <td>
            <TaskStatus status={status} />
          </td>
          <td>{new Date(submitted_at).toLocaleString("en")}</td>
          <td>{new Date(updated_at).toLocaleString("en")}</td>
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
        <Modal.Body>Are you sure you want to cancel this task?</Modal.Body>
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

export default TaskListing;
