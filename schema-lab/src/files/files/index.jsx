import React, { useCallback, useContext, useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";
import { getFiles } from "../../api/v1/files";
import FilesList from "./FilesList";
import FileUploadModal from "./FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Col,
  Container,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { getProjectName } from "../../api/v1/actions";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

const Files = () => {
  const { userDetails } = useContext(UserDetailsContext); // Ensure this context provides `userDetails`
  const [projectName, setProjectName] = useState(null);
  const [files, setFiles] = useState([]);
 

  const fetchFiles = useCallback(() => {
    getFiles({ auth: userDetails.apiKey, recursive: "yes" })
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error("Failed to fetch files:", err));
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
  const handleUploadSuccess = () => {
    fetchFiles();
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="display-6">
            Project Files{" "}
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
        <FilesList files={files} userDetails={userDetails} onUploadSuccess={handleUploadSuccess}/>
      </Row>
      <Row>
        <Col className="col-md-12 text-end"></Col>
      </Row>
    </Container>
  );
};

export default Files;
