import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Alert, Spinner, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
  getExperimentDetails,
  getExperimentTaskDetails,
  retrieveTaskDetails,
  retrieveWorkflowTaskDetails
} from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";

const JsonPreview = ({ json }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!json) return;
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <span>JSON Preview</span>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{copied ? "Copied!" : "Copy JSON"}</Tooltip>}
        >
          <Button size="sm" variant="light" onClick={handleCopy}>
            📋
          </Button>
        </OverlayTrigger>
      </Card.Header>
      <Card.Body
        style={{
          maxHeight: "auto",
          overflowY: "auto",
          backgroundColor: "#282c34",
          color: "#abb2bf",
          fontFamily: "Consolas, Monaco, 'Courier New', monospace",
          fontSize: "0.9rem",
          whiteSpace: "pre-wrap",
          padding: "1rem",
          borderRadius: "0 0 0.375rem 0.375rem",
          userSelect: "text",
        }}
      >
        <pre>{json ? JSON.stringify(json, null, 2) : "No RO-Crate JSON to display."}</pre>
      </Card.Body>
    </Card>
  );
};

const ExportExp = () => {
  const { creator, name } = useParams();
  const navigate = useNavigate();
  const { userDetails } = useContext(UserDetailsContext);

  const [experimentDetails, setExperimentDetails] = useState(null);
  const [tasks, setTasks] = useState([]); // array of detailed tasks with executors
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [roCrateJson, setRoCrateJson] = useState(null);

  // Fetch experiment details + list of task UUIDs
  useEffect(() => {
    if (!creator || !name || !userDetails?.apiKey) return;

    const fetchExperimentAndTasks = async () => {
      setIsLoading(true);
      try {
        const expResponse = await getExperimentDetails({ creator, name, auth: userDetails.apiKey });
        if (!expResponse.ok) throw new Error(`Experiment fetch failed: ${expResponse.status}`);
        const expData = await expResponse.json();

        const taskListResponse = await getExperimentTaskDetails({ creator, name, auth: userDetails.apiKey });
        if (!taskListResponse.ok) throw new Error(`Task list fetch failed: ${taskListResponse.status}`);
        const taskListData = await taskListResponse.json();

        setExperimentDetails(expData);

        // Fetch detailed info for each task sequentially or in parallel:
        const fetchDetailedTasks = async () => {
          const detailedTasks = [];
          for (const task of taskListData) {
            try {
              let response = await retrieveTaskDetails({ taskUUID: task.uuid, auth: userDetails.apiKey });
              if (response.status === 404) {
                response = await retrieveWorkflowTaskDetails({ taskUUID: task.uuid, auth: userDetails.apiKey });
              }
              if (!response.ok) {
                throw new Error(`Error fetching task details for ${task.uuid} status: ${response.status}`);
              }
              const data = await response.json();

              detailedTasks.push({
                uuid: task.uuid,
                name: data.name,
                execution_order: data.execution_order,
                state: data.state,
                executors: data.executors,
                inputs: data.inputs,
                outputs: data.outputs,
              });
            } catch (err) {
              console.warn(`Failed to fetch task details for ${task.uuid}: ${err.message}`);
              // Optionally push partial info or skip this task
            }
          }
          return detailedTasks;
        };

        const detailedTasks = await fetchDetailedTasks();
        setTasks(detailedTasks);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperimentAndTasks();
  }, [creator, name, userDetails]);

  const generateRoCrateMetadata = () => {
    if (!experimentDetails) return null;

    const graph = [
    {
        "@id": "ro-crate-metadata.json",
        "@type": "CreativeWork",
        "conformsTo": { "@id": "https://w3id.org/ro/crate/1.1" },
        "about": { "@id": "./" }
    },
    {
        "@id": "./",
        "@type": "Dataset",
        "name": experimentDetails.name,
        ...(experimentDetails.description && { description: experimentDetails.description }),
        "creator": { "@id": "#creator" },
        "hasPart": tasks.map(task => ({ "@id": task.uuid }))
    },
    {
        "@id": "#creator",
        "@type": "Person",
        "name": experimentDetails.creator
    },
    ...tasks.map(task => ({
        "@id": task.uuid,
        "@type": "SoftwareApplication",
        "name": task.name || task.uuid,
        ...(task.state?.length > 0 && task.state[task.state.length - 1].updated_at ? {
        "dateModified": new Date(task.state[task.state.length - 1].updated_at).toISOString()
        } : {}),
        ...(task.executors && task.executors.length > 0 ? {
        "hasPart": task.executors.map((executor, exIdx) => ({
            "@id": `${task.uuid}-executor-${exIdx}`,
            "@type": "SoftwareApplication",
            "name": executor.name || executor.id || `Executor ${exIdx + 1}`,
            "commandLine": Array.isArray(executor.command) ? executor.command : [executor.command || "Unknown command"],
            ...(executor.image ? { "image": { "@id": executor.image } } : {}),
            ...(task.inputs && task.inputs.length > 0 ? {
            "input": task.inputs.map((input, inIdx) => ({
                "@type": input.type === "FILE" ? "File" : "Dataset",
                "@id": `${task.uuid}-executor-${exIdx}-input-${inIdx}`,
                "name": input.url || `Input file ${inIdx + 1}`,
                "path": input.path || "Unknown path"
            }))
            } : {}),
            ...(task.outputs && task.outputs.length > 0 ? {
            "output": task.outputs.map((output, outIdx) => ({
                "@type": output.type === "FILE" ? "File" : "Dataset",
                "@id": `${task.uuid}-executor-${exIdx}-output-${outIdx}`,
                "name": output.url || `Output file ${outIdx + 1}`,
                "path": output.path || "Unknown path"
            }))
            } : {})
        }))
        } : {})
    }))
    ];

    return {
      "@context": "https://w3id.org/ro/crate/1.1/context",
      "@graph": graph
    };
  };

  useEffect(() => {
    if (experimentDetails) {
      setRoCrateJson(generateRoCrateMetadata());
    } else {
      setRoCrateJson(null);
    }
  }, [experimentDetails, tasks]);

  const exportRoCrate = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      zip.file("ro-crate-metadata.json", JSON.stringify(roCrateJson, null, 2));

      tasks.forEach(task => {
        zip.file(`${task.uuid}.json`, JSON.stringify(task, null, 2));
        if (task.executors) {
          task.executors.forEach((executor, idx) => {
            zip.file(`${task.uuid}-executor-${idx}.json`, JSON.stringify(executor, null, 2));
          });
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${experimentDetails.name}-ro-crate.zip`);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Spinner animation="border" role="status" className="mt-3">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  if (!experimentDetails) {
    return (
      <Alert variant="warning" className="mt-3">
        No experiment details found.
      </Alert>
    );
  }

  return (
    <div>
      <div className="lead mb-3">
        <strong>Name:</strong> {experimentDetails.name}
        <br />
        <strong>Created by:</strong> {experimentDetails.creator}
      </div>

      <JsonPreview json={roCrateJson} />

      <div className="d-flex justify-content-end mt-3 mb-3">
        <Button variant="primary" onClick={() => navigate(-1)} className="me-2">
          Back
        </Button>
        <Button variant="success" onClick={exportRoCrate} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>
    </div>
  );
};

export default ExportExp;
