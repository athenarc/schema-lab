import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import React, { useEffect, useState, useContext, createContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { retrieveTaskDetails } from "../../../api/v1/actions";
import { UserDetailsContext } from "../../../utils/components/auth/AuthProvider";
import TaskStatus  from "../TaskStatus"

export const TaskDetailsContext = createContext();

export const useTaskDetails = () => {
    return useContext(TaskDetailsContext);
};

// Get all the details related to a specific Task UUID
const TaskListDetails = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const { userDetails } = useContext(UserDetailsContext);
    
    const [taskDetails, setTaskDetails] = useState({}); // State to store task details
    const [error, setError] = useState(null); // State variable to store error messages
    const [titleColor, setTitleColor] = useState(''); // State variable to store the color

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await retrieveTaskDetails({
                    taskUUID: uuid,
                    auth: userDetails.apiKey
                });
                if (!response.ok) {
                    throw new Error(`Error network response.. Status: ${response.status}, Status Text: ${response.statusText}`);
                }
                const data = await response.json();
                setTaskDetails({
                    name: data.name,
                    status: data.status,
                    executors: data.executors,
                    inputs: data.inputs,
                    outputs: data.outputs,
                });
            } catch (error) {
                setError(error.toString());
            }
        };
        if (uuid && userDetails && userDetails.apiKey) {
            fetchTaskDetails();
        }
    }, [uuid, userDetails]);

    const renderNavLinks = () => {
        const navLinks = [
            { to: 'executors', text: 'Executors' },
            { to: 'inputs', text: 'Inputs' },
            { to: 'outputs', text: 'Outputs' }
        ];

        return navLinks.map((link, index) => (
            <Nav.Link
                as={Link}
                to={link.to}
                key={index}
                state={{ taskDetails }}
                className={currentPath.endsWith(link.to) ? 'active' : ''}
            >
                {link.text}
            </Nav.Link>
        ));
    };

    const handleColorChange = (color) => {
        setTitleColor(color); 
    };
    const title = taskDetails.name
    ? (
        <span>
            Name: <span className={`text-${titleColor}`}>{taskDetails.name}</span>
            <span> (<span className={`text-${titleColor} fs-6`}>{uuid}</span>)</span>
        </span>
    )
    : (
        <span>
            UUID: <span className={`text-${titleColor}`}>{uuid}</span>
        </span>
    );

    const subtitle = taskDetails.status
        ? <span><TaskStatus status={taskDetails.status} onColorChange={handleColorChange} /></span>
        : ' - ';

    return (
        <TaskDetailsContext.Provider value={taskDetails}>
            <div>
                <div>
                    <div className="lead">{title}</div>
                    <div className="lead">{subtitle}</div>
                    <Navbar bg="light" data-bs-theme="info">
                        <Container>
                            <Nav variant="underline">
                                {renderNavLinks()}
                            </Nav>
                        </Container>
                    </Navbar>
                </div>
                <Outlet />
            </div>
            <div className="mt-3">
                <Button variant="primary" onClick={() => navigate("/Dashboard")}>Back</Button>
            </div>
        </TaskDetailsContext.Provider>
    );
};

export default TaskListDetails;