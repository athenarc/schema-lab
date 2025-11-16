import React, { useState, useContext } from 'react';
import { Form, Button, Row, Col, Card, Container, Table, Modal, Accordion, OverlayTrigger, Tooltip} from "react-bootstrap";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import TaskStatus from "../../TaskStatus";
import { postExperiment, putExperimentTasks } from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';


const CreateExperiment = () => {
    const navigate = useNavigate();
    const [experimentName, setExperimentName] = useState('');
    const [description, setDescription] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeKey, setActiveKey] = useState("0");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const { userDetails } = useContext(UserDetailsContext);
    const location = useLocation();
    const [selectedTasks, setSelectedTasks] = useState(location.state?.selectedTasks || []);

    const [inputs, setInputs] = useState([{ name: "", description: "", type: ""}]);

    const apiKey = userDetails.apiKey;

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const requiredFields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });

        if (isValid) {
            setShowConfirmModal(true);
        }
    };

    const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        setInputs(inputs.map((input, i) =>
            i === index ? { ...input, [name]: value } : input
        ));
    };

    const addInputField = () => {
        const newInput = { name: "", description: "", type: ""};
        setInputs(prevInputs => [...prevInputs, newInput]);
    };

    const removeInputField = () => {
        setInputs(prevInputs => prevInputs.slice(0, -1));
    };

    const handleToggle = (eventKey) => {
        setActiveKey(activeKey === eventKey ? null : eventKey);
    };

    const handleConfirmSubmit = async () => {
        const experimentData = {
            name: experimentName,
            description: description
        };

        const taskUuids = selectedTasks.map((task) => task.uuid);

        try {
            // Step 1: Post Experiment data (name and description)
            const postResponse = await postExperiment(apiKey, experimentData);
            // Step 2: Post Task Details
            const putResponse = await putExperimentTasks(apiKey, postResponse.creator, experimentName, taskUuids);
            setShowConfirmModal(false);
            setShowModal(true);

        } catch (error) {
            setErrorMessage(
                <>Experiment name <strong>{experimentName}</strong> must be unique. Please choose a different name.</>
            );
            setTimeout(() => setErrorMessage(null), 3000);
            setShowConfirmModal(false);
            console.error(error);
        }
    };

    const handleCancelBack = () => {
        setShowConfirmModal(false);
    };

    const handleClear = () => {
        setDescription("");
        setExperimentName("");
        setSelectedTasks([]);
    };

    return (
        <Container className='py-5'>
            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger mt-4 text-center">
                    {errorMessage}
                </div>
            )}
            <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body>
                    <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                        *All fields marked with an asterisk (*) are required.
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Card className="border-0 shadow-sm rounded-3 mb-4">
                            <Card.Header className={`bg-primary text-white ${activeKey === "0" ? "border-bottom" : ""}`}>
                                Basic Information
                            </Card.Header>
                            <Card.Body>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3" className="fw-bold">
                                        Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Col sm="9">
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={experimentName}
                                            onChange={(e) => setExperimentName(e.target.value)}
                                            placeholder="Type name..."
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3" className="fw-bold">
                                        Description
                                    </Form.Label>
                                    <Col sm="9">
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter a detailed description..."
                                        />
                                    </Col>
                                </Form.Group>


                                <Accordion activeKey={activeKey} onSelect={handleToggle} className="mb-4">
                                    <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        Publications (Optional)&nbsp;
                                        <FontAwesomeIcon 
                                            icon={faInfoCircle} 
                                            className="ms-2" 
                                            data-bs-toggle="tooltip" 
                                            data-bs-placement="top" 
                                            title="Related publications is optional." 
                                        />
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {inputs.map((input, index) =>  (
                                            <div key={index} className="mb-4">

                                                <Form.Group as={Row} className="mb-3">
                                                    <Form.Label column sm="3" className="fw-bold">
                                                        Type
                                                    </Form.Label>
                                                    <Col sm="8">
                                                        <Form.Select
                                                            name="type"
                                                            value={input.type}
                                                            onChange={(e) => handleInputChange(index, e)}
                                                        >
                                                            <option value="">Select reference type</option>
                                                            <option value="DOI">DOI</option>
                                                            <option value="LINK">Link</option>
                                                        </Form.Select>
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} className="mb-3">
                                                    <Form.Label column sm="3" className="fw-bold">
                                                        Reference
                                                    </Form.Label>
                                                    <Col sm="8">
                                                        <Form.Control
                                                            type="text"
                                                            name="reference"
                                                            value={input.name}
                                                            onChange={(e) => handleInputChange(index, e)}
                                                            placeholder="Type link or DOI..."
                                                        />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} className="mb-3">
                                                    <Form.Label column sm="3" className="fw-bold">
                                                        Description
                                                    </Form.Label>
                                                    <Col sm="8">
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            name="description"
                                                            value={input.description}
                                                            onChange={(e) => handleInputChange(index, e)}
                                                            placeholder="Type description..."
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        ))}
                                        <div className="d-flex justify-content-start gap-2 mt-4">
                                            <Button variant="primary" onClick={addInputField}>
                                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                Add
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => removeInputField(inputs[inputs.length - 1]?.id)}
                                                disabled={inputs.length === 1}
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="me-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>






                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-3 mb-4">
                            <Card.Header className={`bg-primary text-white ${activeKey === "0" ? "border-bottom" : ""}`}>
                                Selected Tasks
                            </Card.Header>
                            <Card.Body>
                                <Table borderless responsive hover>
                                    <thead>
                                        <tr>
                                            <th>Name/UUID</th>
                                            <th>Status</th>
                                            <th>Submission</th>
                                            <th>Last Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTasks.length === 0 ? (
                                            <tr>
                                                <td colSpan="4">
                                                    <div className="alert alert-warning text-center" role="alert">
                                                        No tasks selected.
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedTasks.map((task) => (
                                                <tr key={task.uuid}>
                                                    <td>
                                                        <Link to={`/task-details/${task.uuid}/executors`}>{task.uuid}</Link>
                                                    </td>
                                                    <td><TaskStatus status={task.state.status} /></td>
                                                    <td>{new Date(task.submitted_at).toLocaleString('en')}</td>
                                                    <td>{new Date(task.state.updated_at).toLocaleString('en')}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="primary" className="me-2" onClick={() => navigate(-1)}>
                                Back
                            </Button>
                            <Button variant="primary" className="me-2" onClick={handleClear}>
                                Clear All
                            </Button>
                            <Button variant="success" type="submit">
                                Save
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={handleCancelBack}>
                <Modal.Body>
                    Are you sure you want to save this experiment?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleCancelBack}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleConfirmSubmit}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Experiment Created Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your experiment has been created successfully.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowModal(false);
                            navigate('/preview');
                        }}
                    >
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CreateExperiment;
