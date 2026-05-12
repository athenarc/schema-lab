import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Card, Container } from "react-bootstrap";
import { UserDetailsContext } from "../utils/components/auth/AuthProvider";
import ConfirmationModal from "./ConfirmationModal";
import ListenerFormFields from "./ListenerFormFields";
import ModelerFormFields from "./ModelerFormFields";

const StreamingTaskForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const taskData = state?.taskData || null;
  const [showModal, setShowModal] = useState(false);
  const [listener, setListener] = useState({
    name: "",
    description: "",
    listenerDatabase: "InfluxDB",
    baseReadingUrl: "",
    baseWritingUrl: "",
    token: "",
    organization: "",
    department: "",
    entity: "",
    metric: "",
    frequency: "",
  });
  const [modelers, setModelers] = useState([
    {
      image: "",
      command: [],
      endpoint: "/model",
      port: "",
      workdir: "",
      stdout: "",
      stderr: "",
      env: {},
    },
  ]);
  const [resources, setResources] = useState({
    cpu_cores: 1,
    zones: "",
    preemptible: false,
    disk_gb: 5.0,
    ram_gb: 1.0,
  });
  // Fill input boxes with data if UUID already exists
  useEffect(() => {
    if (taskData) {
      setListener({
        name: taskData.name || "",
        description: taskData.description || "",
        listenerDatabase: "InfluxDB",
        baseReadingUrl: taskData.baseReadingUrl || "",
        baseWritingUrl: taskData.baseWritingUrl || "",
        token: taskData.token || "",
        organization: taskData.organization || "",
        department: taskData.department || "",
        entity: taskData.entity || "",
        metric: taskData.metric || "",
        frequency: taskData.frequency || "",
      });

      setModelers(
        Array.isArray(taskData.modelers) && taskData.modelers.length > 0
          ? taskData.modelers.map((modeler) => ({
              image: modeler?.image || "",
              command: modeler?.command || [],
              endpoint: modeler?.endpoint || "/model",
              port: modeler?.port || "",
              workdir: modeler?.workdir || "",
              stdout: modeler?.stdout || "",
              stderr: modeler?.stderr || "",
              env: modeler?.env || {},
            }))
          : [
              {
                image: "",
                command: [],
                endpoint: "/model",
                port: "",
                workdir: "",
                stdout: "",
                stderr: "",
                env: {},
              },
            ],
      );
      setResources({
        cpu_cores: taskData?.resources?.cpu_cores || 1,
        zones: taskData?.resources?.zones || "",
        preemptible: taskData?.resources?.preemptible || false,
        disk_gb: taskData?.resources?.disk_gb || 5.0,
        ram_gb: taskData?.resources?.ram_gb || 1.0,
      });
    }
  }, [taskData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const requiredFields = form.querySelectorAll(
      "input[required], textarea[required]",
    );
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add("is-invalid");
      } else {
        field.classList.remove("is-invalid");
      }
    });

    if (isValid) {
      setShowModal(true);
    }
  };

  const isEmpty = (value) => {
    if (typeof value === "string") {
      return value.trim() === "";
    } else if (Array.isArray(value)) {
      return value.length === 0 || value.every(isEmpty);
    } else if (typeof value === "object" && value !== null) {
      return (
        Object.keys(value).length === 0 || Object.values(value).every(isEmpty)
      );
    } else if (typeof value === "number") {
      return isNaN(value) || value === 0;
    }
    return value === null || value === undefined;
  };

  const cleanEmptyValues = (data) => {
    if (Array.isArray(data)) {
      return data.map(cleanEmptyValues).filter((value) => !isEmpty(value));
    } else if (typeof data === "object" && data !== null) {
      return Object.fromEntries(
        Object.entries(data)
          .map(([key, value]) => [key, cleanEmptyValues(value)])
          .filter(([key, value]) => !isEmpty(value)),
      );
    }
    return data;
  };

  const prepareRequestData = () => {
    const {
      name,
      description,
      tags,
      baseReadingUrl,
      baseWritingUrl,
      token,
      organization,
      department,
      entity,
      metric,
      frequency,
    } = listener;
    const data = {
      name,
      description,
      tags,
      baseReadingUrl,
      baseWritingUrl,
      token,
      organization,
      department,
      entity,
      metric,
      frequency,
      modelers,
      resources,
    };

    return cleanEmptyValues(data);
  };

  const handleConfirmSubmit = () => {
    const requestData = prepareRequestData();
    console.log("Prepared Request Data:", requestData);
  };

  const handleModalClose = () => setShowModal(false);

  const handleListenerChange = (e) => {
    const { name, value } = e.target;

    setListener((prevData) => {
      if (name === "tags") {
        const tagsArray = value.split(",");
        return { ...prevData, tags: tagsArray };
      } else {
        return { ...prevData, [name]: value };
      }
    });
  };

  const handleModelerChange = (index, e) => {
    const { name, value } = e.target;

    setModelers((prevModelers) => {
      const updatedModelers = [...prevModelers];
      const updatedModeler = { ...updatedModelers[index] };

      if (name === "command") {
        updatedModeler.command = value.split(" ");
      } else if (name === "env") {
        const envObject = value.split(" ").reduce((acc, pair) => {
          const [key, ...val] = pair.split(":");
          if (key) acc[key] = val.join(":");
          return acc;
        }, {});
        updatedModeler.env = envObject;
      } else {
        updatedModeler[name] = value;
      }

      updatedModelers[index] = updatedModeler;
      return updatedModelers;
    });
  };

  // Clear input boxes
  const handleClear = () => {
    setListener({
      name: "",
      description: "",
      tags: [],
      baseReadingUrl: "",
      baseWritingUrl: "",
      token: "",
      organization: "",
      department: "",
      entity: "",
      metric: "",
      frequency: "",
    });
    setModelers([
      {
        image: "",
        command: [],
        workdir: "",
        stdout: "",
        stderr: "",
        env: {},
        port: "",
        endpoint: "/model",
      },
    ]);
    setResources({
      cpu_cores: 1,
      zones: "",
      preemptible: false,
      disk_gb: 5.0,
      ram_gb: 1.0,
    });
  };

  const handleResourceChange = (event) => {
    const { name, type, value, checked } = event.target;
    const newValue =
      name === "cpu_cores"
        ? Number(value)
        : type === "checkbox"
          ? checked
          : value;
    setResources((prevResources) => ({
      ...prevResources,
      [name]: newValue,
    }));
  };

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
            *All fields marked with an asterisk (*) are required.
          </p>
          <Form onSubmit={handleSubmit}>
            <ListenerFormFields
              listener={listener}
              handleListenerChange={handleListenerChange}
            />
            <ModelerFormFields
              modelers={modelers}
              handleModelerChange={handleModelerChange}
            />

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" className="me-2" onClick={handleClear}>
                Clear All
              </Button>
              <Button
                variant="danger"
                className="me-2"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button variant="success" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <ConfirmationModal
        showModal={showModal}
        handleModalClose={handleModalClose}
        handleConfirmSubmit={handleConfirmSubmit}
        listener={listener}
        modelers={modelers}
        resources={resources}
      />
    </Container>
  );
};

export default StreamingTaskForm;
