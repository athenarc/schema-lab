import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowUp, faList, faFileCircleCheck, faFileCircleXmark, faStopwatch, faGears, faCheck, faXmark, faQuestion } from '@fortawesome/free-solid-svg-icons';

const TaskStatus = (props) => {
    let color, icon, text = props.status;
    switch (props.status) {
        case "SUBMITTED":
            icon = faFileArrowUp;
            color = "text-success";
            break;
        case "APPROVED":
            icon = faFileCircleCheck;
            color = "text-success";
            break;
        case "REJECTED":
            color = "text-danger";
            icon = faFileCircleXmark;
            break;
        case "SCHEDULED":
            icon = faStopwatch;
            color = "text-success";
            break;
        case "INITIALIZING":
        case "RUNNING":
            icon = faGears;
            color = "text-success";
            break;
        case "COMPLETED":
            color = "text-success";
            icon = faCheck;
            break;
        case "ERROR":
        case "CANCELED":
            color = "text-danger";
            icon = faXmark;
            break;
        case "ALL":
            color = "text-dark"
            icon = faList;
            break;
        case "UNKNOWN":
        default:
            text = "UNKNOWN";
            color = "text-muted";
            icon = faQuestion;
            break;
    }
   
    useEffect(() => {
        if (props.onColorChange) {
            props.onColorChange(color);
        }
    }, [color, props]);

    return (
        <span style={{ color: color }} className={`${color}`}>
            <FontAwesomeIcon icon={icon} /> {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
        </span>
    );
};

export default TaskStatus;