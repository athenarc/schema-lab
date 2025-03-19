import React, { useState } from 'react';
import { useTaskDetails } from './TaskListDetails';
import { Card, Alert, Table, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import JSONViewer from 'react-json-view'; // install npm install react-json-view


// Helper function to format the value
const formatValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    
    if (Array.isArray(value)) {
        if (value.every(item => typeof item === 'string')) {
            return value.join(' ');
        } else if (value.length > 0 && typeof value[0] === 'object' && value[0].name && value[0].path) {
            return value.map(item => `${item.name}; ${item.path}`).join(', ');
        } else {
            return JSON.stringify(value);
        }
    } else if (typeof value === 'object' && value !== null) {
        if (value.name && value.path) {
            return (
                <span className="yields-field">
                    <strong>{value.name}</strong>; <code>{value.path}</code>
                </span>
            );
        }
        return JSON.stringify(value);
    } else if (typeof value === 'string' && value.trim().includes(' ')) {
        return value.split(/\s+/).join(' ');
    }
    return String(value);
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Tooltip content
const renderTooltip = (props) => (
    <Tooltip id="tooltip" {...props}>
        Switch between JSON viewer and regular view
    </Tooltip>
);

const Executors = () => {
    const taskDetails = useTaskDetails();
    const [showJsonViewer, setShowJsonViewer] = useState(false);

    // Check if taskDetails and executors data exist
    if (!taskDetails || !taskDetails.executors) {
        return (
            <Alert variant="warning" className="mt-3">
                No task details are available!
            </Alert>
        );
    }

    const executorsData = Array.isArray(taskDetails.executors) ? taskDetails.executors : [taskDetails.executors];

    return (
        <div>
            <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Form.Check
                    type="checkbox"
                    id="toggle-view"
                    label={<span className="form-text text-muted">Switch to JSON viewer</span>}
                    checked={showJsonViewer}
                    onChange={(e) => setShowJsonViewer(e.target.checked)}
                />
            </OverlayTrigger>

            <div className="mt-1">
                {showJsonViewer ? (
                    <Card>
                        <Card.Body>
                            <JSONViewer src={taskDetails.executors} theme="default:inverted" />
                        </Card.Body>
                    </Card>
                ) : (
                    executorsData.map((executor, index) => (
                        <Card className="mt-1" key={index}>
                            <Card.Body className='pb-0'>
                                <Card.Subtitle className="p-2 bg-light fw-bold">Executor {index}</Card.Subtitle>
                                <Table hover>
                                    <tbody>
                                        {Object.entries(executor).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="col-1 bg-light text-end">{capitalizeFirstLetter(key)}:</td>
                                                <td>{formatValue(value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Executors;