import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container, Modal, Alert } from "react-bootstrap";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { editExperiment, getExperimentDetails } from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";

const PatchExperiment = () => {
    const navigate = useNavigate();
    const { userDetails } = useContext(UserDetailsContext);
    const location = useLocation();
    const { creator, name } = useParams();
    const apiKey = userDetails.apiKey;

    const [experimentName, setExperimentName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTasks, setSelectedTasks] = useState(location.state?.selectedTasks || []);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchExperimentData = async () => {
            try {
                const response = await getExperimentDetails({ 
                    creator, 
                    name, 
                    auth: apiKey 
                });
                if (response.ok) {
                    const experimentDetails = await response.json();
                    setExperimentName(experimentDetails.name);
                    setDescription(experimentDetails.description);
                    setSelectedTasks(experimentDetails.tasks || []);
                } else {
                    throw new Error('Failed to fetch experiment details');
                }
            } catch (error) {
                setErrorMessage('Failed to fetch experiment details.');
            } finally {
                setLoading(false);  
            }
        };

        fetchExperimentData();
    }, [creator, name, apiKey]);

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
            setErrorMessage(null); // Clear any existing error
            setShowConfirmModal(true);
        }
    };

    const handleConfirmSubmit = async () => {
        const experimentData = {
            name: experimentName,
            description: description
        };
    
        try {
            const editResponse = await editExperiment(
                creator,
                name,
                apiKey,
                experimentData
            );
            if (!editResponse.ok) {
                const errorData = await editResponse.json();
                throw new Error(errorData.message || 'Failed to update the experiment');
            }

            setShowConfirmModal(false);
            setShowModal(true);
        } catch (error) {
            setShowConfirmModal(false);
            setErrorMessage(error.message); 

            // Automatically clear the error message after 3 seconds
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
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

    if (loading) {
        return (
            <Container className="py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            {/* Error Message */}
            {errorMessage && (
                <Alert variant="danger" className='text-center' onClose={() => setErrorMessage(null)} dismissible>
                    {errorMessage}: <strong>Name</strong> used from other experiment.
                </Alert>
            )}

            <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body>
                    <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                        *All fields marked with an asterisk (*) are required.
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Card className="border-0 shadow-sm rounded-3 mb-4">
                            <Card.Header className="bg-primary text-white">
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
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={handleCancelBack}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Experiment Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to edit this experiment?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelBack}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleConfirmSubmit}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Experiment Updated Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your experiment has been updated successfully.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => { setShowModal(false); navigate(-1); }}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PatchExperiment;
