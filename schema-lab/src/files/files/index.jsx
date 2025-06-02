import { useCallback, useContext, useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";
import { getFiles } from "../../api/v1/files";
import FilesList from "./FilesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getProjectName } from "../../api/v1/actions";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

const Files = () => {
  const { userDetails } = useContext(UserDetailsContext);
  const [projectName, setProjectName] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(() => {
    setLoading(true);
    getFiles({ auth: userDetails.apiKey, recursive: "yes" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 500) {
            throw new Error("Internal Server Error (500)");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setFiles(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch files:", err.message);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userDetails.apiKey]);

  useEffect(() => {
    if (userDetails && userDetails.apiKey) {
      getProjectName(userDetails.apiKey)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setProjectName(data.name || "No project name available");
        });
    }
  }, [userDetails]);
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
  const handleFetchFiles = () => {
    fetchFiles();
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="display-6">
            Files{" "}
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="button-tooltip">
                  You are currently connected using a token for the project:{" "}
                  {projectName}
                </Tooltip>
              }
            >
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="fs-6 py-2"
                style={{ cursor: "pointer" }}
              />
            </OverlayTrigger>
          </h1>
        </Col>
      </Row>
      <Row>
        <FilesList
          files={files}
          userDetails={userDetails}
          onFetchFiles={handleFetchFiles}
          error={error}
          loading={loading}
        />
      </Row>
      <Row>
        <Col className="col-md-12 text-end"></Col>
      </Row>
    </Container>
  );
};

export default Files;
