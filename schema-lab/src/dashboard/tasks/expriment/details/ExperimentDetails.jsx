import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Alert, Card, Table } from "react-bootstrap";
import { getExperimentDetails, getExperimentTaskDetails } from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";
import TaskStatus from "../../TaskStatus";

const ExperimentDetails = () => {
    const { creator, name } = useParams();
    const navigate = useNavigate();
    const { userDetails } = useContext(UserDetailsContext);
    const [experimentDetails, setExperimentDetails] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    // Fetch experiment details and tasks
    useEffect(() => {
        const fetchExperimentDetails = async () => {
            try {
                const response = await getExperimentDetails({
                    creator,
                    name,
                    auth: userDetails.apiKey,
                });

                if (!response.ok) {
                    throw new Error(`Error fetching experiment details. Status: ${response.status}`);
                }

                const data = await response.json();
                setExperimentDetails(data);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchTasks = async () => {
            try {
                const response = await getExperimentTaskDetails({
                    creator,
                    name,
                    auth: userDetails.apiKey,
                });

                if (!response.ok) {
                    throw new Error(`Error fetching tasks. Status: ${response.status}`);
                }

                const data = await response.json();
                setTasks(data);
            } catch (error) {
                setError(error.message);
            }
        };

        if (creator && name && userDetails.apiKey) {
            fetchExperimentDetails();
            fetchTasks();
        }
    }, [creator, name, userDetails]);

    return (
        <div>
            {error ? (
                <Alert variant="danger" className="mt-3">
                    {error}
                </Alert>
            ) : (
                <div>
                    {experimentDetails ? (
                        <>
                            <div className="lead">
                                <strong>Name:</strong> {experimentDetails.name}
                                <br />
                                <strong>Created by:</strong> {experimentDetails.creator}
                            </div>

                            {experimentDetails.description && (
                                <Card className="border-0 shadow-sm rounded-3 mt-4">
                                    <Card.Header className="bg-primary text-white py-3">Description</Card.Header>
                                    <Card.Body>
                                        <Card.Text>{experimentDetails.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            )}

                            <Card className="border-0 shadow-sm rounded-3 mt-4">
                                <Card.Header className="bg-primary text-white py-3">Selected Tasks</Card.Header>
                                <Card.Body>
                                    <Table borderless responsive hover>
                                        <thead>
                                            <tr>
                                                <th className="col-4 text-start">
                                                    Name/UUID
                                                </th>
                                                <th className="col-2 text-start">
                                                    Status
                                                </th>
                                                {/* <th className="col-4 text-start">Submission Time</th> */}
                                                <th className="col-4 text-start">
                                                    Last Update
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3">
                                                        <div className="alert alert-warning text-center" role="alert">
                                                            No tasks available.
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                tasks.map((task) => (
                                                    <tr key={task.uuid}>
                                                        <td>
                                                            <Link
                                                            to={`/task-details/${task.uuid}/executors`} state={{ from: 'experiments', creator: `${experimentDetails.creator}`, name: `${experimentDetails.name}` }}>
                                                            {task.uuid}</Link>
                                                        </td>
                                                        <td><TaskStatus status={task.current_status.status} /></td>
                                                        {/* <td>{new Date(task.submitted_at).toLocaleString('en')}</td> */}
                                                        <td>{new Date(task.current_status.updated_at).toLocaleString('en')}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </>
                    ) : (
                        <span>Loading experiment details...</span>
                    )}
                </div>
            )}

            <div className="mt-3">
                <Button variant="primary" onClick={() => navigate("/preview")}>
                    Back
                </Button>
            </div>
        </div>
    );
};

export default ExperimentDetails;
