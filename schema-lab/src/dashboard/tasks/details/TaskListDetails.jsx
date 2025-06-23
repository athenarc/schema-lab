import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import React, { useEffect, useState, useContext, createContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { retrieveTaskDetails, retrieveWorkflowTaskDetails } from "../../../api/v1/actions";
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
                let response = await retrieveTaskDetails({
                    taskUUID: uuid,
                    auth: userDetails.apiKey
                });
    
                if (response.status === 404) {
                    response = await retrieveWorkflowTaskDetails({
                        taskUUID: uuid,
                        auth: userDetails.apiKey
                    });
                }
    
                if (!response.ok) {
                    throw new Error(`Error network response.. Status: ${response.status}, Status Text: ${response.statusText}`);
                }
    
                const data = await response.json();
    
                setTaskDetails(prev => ({
                    ...prev,
                    name: data.name,
                    execution_order: data.execution_order,
                    status: data.status_history?.[data.status_history.length - 1]?.status || "Unknown",
                    executors: data.executors,
                    inputs: data.inputs,
                    outputs: data.outputs,
                }));
            } catch (error) {
                setError(error.toString());
            }
        };
    
        if (uuid && userDetails?.apiKey) {
            fetchTaskDetails();
        }
    }, [uuid, userDetails]);
    

    // Get state with defaults
    const { from: parent = 'defaultparent', creator = 'defaultcreator', name = 'defaultname' } = location.state || {};
    // Common state object
    const commonState = { from: parent, parent, creator, name };

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
                state={commonState} // Spread the common state
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

    const execution_order = (
        <span>
            Execution order: <span>
                {Array.isArray(taskDetails.execution_order) 
                    ? [...taskDetails.execution_order].reverse().join(', ') 
                    : taskDetails.execution_order || ' Not available '}
            </span>
        </span>
    );

    // Redirect BACK button depending on the parent
    const handleBack = () => {
        if (parent === 'tasks')  {
            navigate('/dashboard');
        } else if (parent === 'experiments') {
            navigate(`/experiment-details/${creator}/${name}/description`);
        } else {
            navigate('/defaultParent'); // Fallback
        }
    };
    
    return (
        <TaskDetailsContext.Provider value={taskDetails}>
            <div>
                <div>
                    <div className="lead">{title}</div>
                    <div className="lead">{subtitle}</div>
                    <div className="text-muted">{execution_order}</div>
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
                <Button variant="primary" onClick={handleBack}>Back</Button>
            </div>
        </TaskDetailsContext.Provider>
    );
};

export default TaskListDetails;