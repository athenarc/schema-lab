import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Container, Accordion, OverlayTrigger, Tooltip, Modal, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { runTaskPost } from "../api/v1/actions";
import { UserDetailsContext } from "../utils/components/auth/AuthProvider";
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';

const TaskForm = () => {
    const navigate = useNavigate();
    // Get data from re-run action
    const { state } = useLocation();
    const taskData = state?.taskData || null;
    const [activeKey, setActiveKey] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [basicData, setBasicData] = useState({name: "", description: "", tags: [] });
    const [executors, setExecutors] = useState([{image: "", command: [], workdir: "", stdout: "", stderr: "", env: ""}]);
    const [inputs, setInputs] = useState([{ name: "", description: "", url: "", path: "", content: "", type: ""}]);
    const [outputs, setOutputs] = useState([{ name: "", description: "", url: "", path: "", type: ""}]);
    const [resources, setResources] = useState({ cpu_cores: 1, zones: "", preemptible: false, disk_gb: 5.0, ram_gb: 1.0 });
    const [volumes, setVolumes] = useState([]);
    const [showJson, setShowJson] = useState(false);
    const { userDetails } = useContext(UserDetailsContext);

    // Fill input boxes with data if UUID already exists
    useEffect(() => {
        if (taskData) {
            setBasicData({
                name: taskData.name || "",
                description: taskData.description || "",
                tags: taskData.tags || []
            });

            setExecutors(
                Array.isArray(taskData.executors) && taskData.executors.length > 0
                    ? taskData.executors.map((executor) => ({
                          image: executor?.image || "",
                          command: executor?.command || [],
                          workdir: executor?.workdir || "",
                          stdout: executor?.stdout || "",
                          stderr: executor?.stderr || "",
                          env: executor?.env || {}
                      }))
                    : [{ image: "", command: [], workdir: "", stdout: "", stderr: "", env: {} }]
            );

            setInputs(
                Array.isArray(taskData.inputs)
                    ? taskData.inputs.map((input) => ({
                          name: input?.name || "",
                          description: input?.description || "",
                          url: input?.url || "",
                          path: input?.path || "",
                          content: input?.content || "",
                          type: input?.type || ""
                      }))
                    : [{ name: "", description: "", url: "", path: "", content: "", type: "" }]
            );

            setOutputs(
                Array.isArray(taskData.outputs)
                    ? taskData.outputs.map((output) => ({
                          name: output?.name || "",
                          description: output?.description || "",
                          url: output?.url || "",
                          path: output?.path || "",
                          type: output?.type || ""
                      }))
                    : [{ name: "", description: "", url: "", path: "", type: "" }]
            );

            setVolumes(taskData?.volumes || []);

            setResources({
                cpu_cores: taskData?.resources?.cpu_cores || 1,
                zones: taskData?.resources?.zones || "",
                preemptible: taskData?.resources?.preemptible || false,
                disk_gb: taskData?.resources?.disk_gb || 5.0,
                ram_gb: taskData?.resources?.ram_gb || 1.0,
            });
        }
    }, [taskData]);


    const handleToggle = (eventKey) => {
        setActiveKey(activeKey === eventKey ? null : eventKey);
    };

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
            setShowModal(true);
        }
    };


    const isEmpty = (value) => {
        if (typeof value === 'string') {
            return value.trim() === '';
        } else if (Array.isArray(value)) {
            return value.length === 0 || value.every(isEmpty);
        } else if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length === 0 || Object.values(value).every(isEmpty);
        } else if (typeof value === 'number') {
            return isNaN(value) || value === 0;
        }
        return value === null || value === undefined;
    };
    
    const cleanEmptyValues = (data) => {
        if (Array.isArray(data)) {
            return data.map(cleanEmptyValues).filter(value => !isEmpty(value));
        } else if (typeof data === 'object' && data !== null) {
            return Object.fromEntries(
                Object.entries(data)
                    .map(([key, value]) => [key, cleanEmptyValues(value)])
                    .filter(([key, value]) => !isEmpty(value))
            );
        }
        return data;
    };
    
    const prepareRequestData = () => {
        const { name, description, tags } = basicData;
        const data = {
            name,
            description,
            tags,
            executors,
            inputs,
            outputs,
            resources,
            volumes
        };
    
        return cleanEmptyValues(data);
    };

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');

    const handleConfirmSubmit = () => {
        const requestData = prepareRequestData();
        runTaskPost(userDetails.apiKey, requestData)
            .then(response => {
                if (response.ok) {
                    setAlertVariant('success');
                    setAlertMessage('The task has been submitted successfully!');
                    setShowAlert(true);
                    setTimeout(() => {
                        navigate('/Dashboard'); // Navigate to /Dashboard after a delay
                    }, 2000);
                } else {
                    console.error('Failed to submit task');
                    setAlertMessage('Failed to submit task!');
                    setAlertVariant('danger');
                    setShowAlert(true);
                }
            })
            .catch(error => {
                console.error('Error submitting task:', error);
                setAlertMessage('Failed to submit task!');
                setAlertVariant('danger');
                setShowAlert(true);
            })
            .finally(() => {
                setShowModal(false);
                handleClear();
            });
    };

    const handleModalClose = () => setShowModal(false);

    const handleBasicChange = (e) => {
        const { name, value } = e.target;

        setBasicData((prevData) => {
            if (name === 'tags') {
                const tagsArray = value.split(',');
                return { ...prevData, tags: tagsArray };
            } else {
                return { ...prevData, [name]: value };
            }
        });
    };

    const handleExecutorChange = (index, e) => {
        const { name, value } = e.target;
    
        setExecutors(prevExecutors => {
            const updatedExecutors = [...prevExecutors];
            const updatedExecutor = { ...updatedExecutors[index] };
    
            if (name === "command") {
                updatedExecutor.command = value.split(' ');
            } else if (name === "env") {
                const envObject = value.split(' ').reduce((acc, pair) => {
                    const [key, ...val] = pair.split(':');
                    if (key) acc[key] = val.join(':');
                    return acc;
                }, {});
                updatedExecutor.env = envObject;
            } else {
                updatedExecutor[name] = value;
            }
    
            updatedExecutors[index] = updatedExecutor;
            return updatedExecutors;
        });
    };
    
    // Clear input boxes
    const handleClear = () => {
        setBasicData({name: "", description: "", tags: []});
        setExecutors([{image: "", command: [], workdir: "", stdout: "", stderr: "", env: ""}]);
        setInputs([{ name: "", description: "", url: "", path: "", content: "", type: ""}]);
        setOutputs([{ name: "", description: "", url: "", path: "", type: ""}]);
        setResources({ cpu_cores: 1, zones: "", preemptible: false, disk_gb: 5.0, ram_gb: 1.0 });
        setVolumes([]);
    };

    const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        setInputs(inputs.map((input, i) =>
            i === index ? { ...input, [name]: value } : input
        ));
    };
    
    const handleOutputChange = (index, e) => {
        const { name, value } = e.target;
        setOutputs(outputs.map((output, i) =>
            i === index ? { ...output, [name]: value } : output
        ));
    };


    const handleResourceChange = (event) => {
        const { name, type, value, checked } = event.target;
        const newValue = name === 'cpu_cores' ? Number(value) : (type === 'checkbox' ? checked : value);
        setResources(prevResources => ({
            ...prevResources,
            [name]: newValue,
        }));
    };
    
    const addInputField = () => {
        const newInput = { name: "", description: "", url: "", path: "", content: "", type: ""};
        setInputs(prevInputs => [...prevInputs, newInput]);
    };

    const removeInputField = () => {
        setInputs(prevInputs => prevInputs.slice(0, -1));
    };

    const addOutputField = () => {
        const newInput = { name: "", description: "", url: "", path: "", type: "" };
        setOutputs(prevOutputs => [...prevOutputs, newInput]);
    };

    const removeOutputField = () => {
        setOutputs(prevOutputs => prevOutputs.slice(0, -1));
    };
    
    const handleVolumeInputChange = (e) => {
        const { value } = e.target;
            setVolumes(value.split(' '));
    };

    return (
        <Container className="py-5">
            {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                </Alert>
            )}
            <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body>
                    <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                        *All fields marked with an asterisk (*) are required.
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Card className="border-0 shadow-sm rounded-3 mb-4">
                            <Card.Header className={`bg-primary text-white py-3 ${activeKey === "0" ? "border-bottom" : ""}`}>
                                Basic Information
                            </Card.Header>
                            <Card.Body>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3" className="fw-bold">
                                        Name
                                    </Form.Label>
                                    <Col sm="9">
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={basicData.name}
                                            onChange={handleBasicChange}
                                            placeholder="Type name..."
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
                                            value={basicData.description}
                                            onChange={handleBasicChange}
                                            placeholder="Enter a detailed description..."
                                        />
                                    </Col>
                                </Form.Group>


                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3" className="fw-bold">
                                        Tags
                                    </Form.Label>
                                    <Col sm="9">
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-tags`}>Please split tags with comma</Tooltip>}
                                        >
                                            <Form.Control
                                                type="text"
                                                name="tags"
                                                value={basicData.tags.join(',')}
                                                onChange={handleBasicChange}
                                                placeholder="Type tags, separated with comma..."
                                            />
                                        </OverlayTrigger>
                                    </Col>
                                </Form.Group>


                            </Card.Body>
                        </Card>

                        {executors.map((executor, index) => (
                            <Card className="border-0 shadow-sm rounded-3 mb-4" key={index}>
                                <Card.Header className={`bg-primary text-white py-3`}>
                                    Executor Information&nbsp; 
                                    <a 
                                        href="https://schema.athenarc.gr/docs/schema-api/arch/tasks" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-white"
                                        style={{ textDecoration: 'none' }}
                                    >
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    </a>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Image <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Col sm="9">
                                            <Form.Control
                                                type="text"
                                                name="image"
                                                value={executor.image}
                                                onChange={(e) => handleExecutorChange(index, e)}
                                                placeholder="Type image path..."
                                                required
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Command <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Col sm="9">
                                            <Form.Control
                                                type="text"
                                                name="command"
                                                value={executor.command.join(' ')}
                                                onChange={(e) => handleExecutorChange(index, e)}
                                                placeholder="Type command..."
                                                required
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Working Directory
                                        </Form.Label>
                                        <Col sm="9">
                                            <Form.Control
                                                type="text"
                                                name="workdir"
                                                value={executor.workdir}
                                                onChange={(e) => handleExecutorChange(index, e)}
                                                placeholder="Type working directory..."
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Stdout
                                        </Form.Label>
                                        <Col sm="9">
                                            <Form.Control
                                                type="text"
                                                name="stdout"
                                                value={executor.stdout}
                                                onChange={(e) => handleExecutorChange(index, e)}
                                                placeholder="Type stdout..."
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Stderr
                                        </Form.Label>
                                        <Col sm="9">
                                            <Form.Control
                                                type="text"
                                                name="stderr"
                                                value={executor.stderr}
                                                onChange={(e) => handleExecutorChange(index, e)}
                                                placeholder="Type stderr..."
                                            />
                                        </Col>
                                    </Form.Group>
                                        <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Env
                                        </Form.Label>
                                        <Col sm="9">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip id={`tooltip-env`}>Please type key:value pairs with the following format: KEY1:VALUE1, KEY2:VALUE2 seperated with comma</Tooltip>}
                                            >
                                            <Form.Control
                                                type="text"
                                                name="env"
                                                value={Object.entries(executor.env).map(([key, val]) => `${key}:${val}`).join(' ')}
                                                onChange={(e) => handleExecutorChange(index, e)}
                                                placeholder="Type environmental vars..."
                                            />
                                            </OverlayTrigger>
                                        </Col>
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        ))}

                        <Accordion activeKey={activeKey} onSelect={handleToggle} className="mb-4">
                            {/* Inputs */}
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    Inputs Information (Optional)
                                </Accordion.Header>
                                <Accordion.Body>
                                    {inputs.map((input, index) =>  (
                                        <div key={index} className="mb-4">
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    Name
                                                </Form.Label>
                                                <Col sm="8">
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={input.name}
                                                        onChange={(e) => handleInputChange(index, e)}
                                                        placeholder="Type name..."
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

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    URL <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Col sm="8">
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Location of a file or directory within your home directory on the remote storage..</Tooltip>}
                                                    >
                                                        <Form.Control
                                                            type="text"
                                                            name="url"
                                                            value={input.url}
                                                            onChange={(e) => handleInputChange(index, e)}
                                                            placeholder="Type URL..."
                                                            required
                                                        />
                                                    </OverlayTrigger>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    Path <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Col sm="8">
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id={`tooltip-env`}>Location where the file or directory will be stored inside the task's container after the task completes.</Tooltip>}
                                                    >
                                                    <Form.Control
                                                        type="text"
                                                        name="path"
                                                        value={input.path}
                                                        onChange={(e) => handleInputChange(index, e)}
                                                        placeholder="Type path..."
                                                    />
                                                    </OverlayTrigger>
                                                </Col>
                                            </Form.Group>

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
                                                        <option value="">Select Type</option>
                                                        <option value="FILE">FILE</option>
                                                        <option value="DIRECTORY">DIRECTORY</option>
                                                    </Form.Select>
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

                            {/* Outputs */}
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>
                                    Outputs Information (Optional)
                                </Accordion.Header>
                                <Accordion.Body>
                                    {outputs.map((output, index) => (
                                        <div key={index} className="mb-4">
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    Name
                                                </Form.Label>
                                                <Col sm="8">
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={output.name}
                                                        onChange={(e) => handleOutputChange(index, e)}
                                                        placeholder="Type name..."
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
                                                        value={output.description}
                                                        onChange={(e) => handleOutputChange(index, e)}
                                                        placeholder="Type description..."
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    URL <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Col sm="8">
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Location of a file or directory within your home directory on the remote storage.</Tooltip>}
                                                    >
                                                    <Form.Control
                                                        type="text"
                                                        name="url"
                                                        value={output.url}
                                                        onChange={(e) => handleOutputChange(index, e)}
                                                        placeholder="Type URL..."
                                                    />
                                                    </OverlayTrigger>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    Path <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Col sm="8">
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id={`tooltip-env`}>Location where the file or directory will be stored inside the task's container after the task completes.</Tooltip>}
                                                    >
                                                    <Form.Control
                                                        type="text"
                                                        name="path"
                                                        value={output.path}
                                                        onChange={(e) => handleOutputChange(index, e)}
                                                        placeholder="Type path..."
                                                    />
                                                    </OverlayTrigger>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="3" className="fw-bold">
                                                    Type
                                                </Form.Label>
                                                <Col sm="8">
                                                    <Form.Select
                                                        name="type"
                                                        value={output.type}
                                                        onChange={(e) => handleOutputChange(index, e)}
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="FILE">FILE</option>
                                                        <option value="DIRECTORY">DIRECTORY</option>
                                                    </Form.Select>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-start gap-2 mt-4">
                                        <Button variant="primary" onClick={addOutputField}>
                                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                                            Add
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => removeOutputField(inputs[outputs.length - 1]?.id)}
                                            disabled={outputs.length === 1}
                                        >
                                            <FontAwesomeIcon icon={faXmark} className="me-2" />
                                            Remove
                                        </Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* Volumes */}
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>
                                    Volumes Information (Optional)&nbsp; 
                                    <a 
                                        href="https://schema.athenarc.gr/docs/schema-api/arch/tasks/" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-dark"
                                        style={{ textDecoration: 'none' }}
                                    >
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    </a>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3" className="fw-bold">
                                            Paths
                                        </Form.Label>
                                        <Col sm="9">
                                        <Form.Control
                                            type="text"
                                            value={volumes.join(' ')}
                                            onChange={handleVolumeInputChange}
                                            placeholder="Type volumes, separated by comma..."
                                        />
                                        </Col>
                                    </Form.Group>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* Resources */}
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>
                                    Resources Information (Optional)
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className="mb-4">                                          
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="3" className="fw-bold">
                                                CPU cores
                                            </Form.Label>
                                            <Col sm="8">
                                                <Form.Control
                                                    type="number"
                                                    name="cpu_cores"
                                                    step="1"
                                                    min="1"
                                                    max="40"
                                                    value={resources.cpu_cores}
                                                    onChange={handleResourceChange}
                                                    placeholder="Select CPU cores..."
                                                />
                                            </Col>
                                        </Form.Group>
                                        
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="3" className="fw-bold">
                                                RAM (Gb)
                                            </Form.Label>
                                            <Col sm="8">
                                                <Form.Control
                                                    type="number"
                                                    name="ram_gb"
                                                    step="0.1"
                                                    min="1.0"
                                                    max="128"
                                                    value={resources.ram_gb}
                                                    onChange={handleResourceChange}
                                                    placeholder="Select RAM size (in Gbytes)..."
                                                />
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="primary" className="me-2" onClick={handleClear}>
                                Clear All
                            </Button>
                            <Button variant="danger" className="me-2" onClick={() => navigate(-1)}>
                                Back
                            </Button>
                            <Button variant="success" type="submit">
                                Submit
                            </Button>
                        </div>
                    </Form>
            
                    <Modal show={showModal} onHide={handleModalClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Submit New Task</Modal.Title>
                        </Modal.Header>
                        <Modal.Footer>
                            <Row className="w-100">
                                <Col className="text-left">
                                    <p> Confirm that you want to submit the task?</p>
                                </Col>
                            </Row>
                            <Row className="w-100 justify-content-center">
                                <Col xs="auto">
                                    <Button variant="danger" onClick={handleModalClose}>
                                        Cancel
                                    </Button>
                                </Col>
                                <Col xs="auto">
                                    <Button variant="success" onClick={handleConfirmSubmit}>
                                        Confirm
                                    </Button>
                                </Col>
                            </Row>
                        </Modal.Footer>

                        <Modal.Body>
                            <div onClick={() => setShowJson(!showJson)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                {showJson ? <FaAngleDown /> : <FaAngleRight />}
                                <span style={{ marginLeft: '8px' }}>Preview JSON</span>
                            </div>

                            {showJson && (
                                <pre>{JSON.stringify({
                                    name: basicData.name,
                                    description: basicData.description,
                                    tags: basicData.tags,
                                    executors,
                                    inputs,
                                    outputs,
                                    volumes,
                                    resources
                                }, null, 2)}</pre>
                            )}
                        </Modal.Body>
                    </Modal>
                    
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TaskForm;
