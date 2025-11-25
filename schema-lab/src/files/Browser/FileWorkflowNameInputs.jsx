import {
  Button,
  Col,
  Form,
  OverlayTrigger,
  Popover,
  Row,
  InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareCheck,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInfoCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  getBaseFilename,
  removeFileExtension,
  validateUniqueFileNames,
  validateFileName,
} from "../utils/files";

export default function FileWorkflowNameInputs({
  selectedFiles,
  handleSetSelectedFiles,
}) {
  // Two validation functions.
  // One to validate individual file names.
  // One to validate all file names for uniqueness.

  const handleFileNameChange = (index, newName) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].name = newName;
    handleSetSelectedFiles(updatedFiles);
  };
  return (
    <div className="mb-4">
      <div className="d-flex gap-1 mb-1">
        <h6 className="fw-semibold mb-1">Workflow File Names</h6>
        <OverlayTrigger
          trigger={["hover", "focus"]}
          placement="right"
          overlay={
            <Popover
              id="path-rules-popover"
              style={{ maxWidth: "300px", borderRadius: "8px" }}
            >
              <Popover.Header
                as="h6"
                className="py-2 px-3 bg-primary text-white"
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderBottom: "1px solid #e5e7eb",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                File Input Path Rules
              </Popover.Header>

              <Popover.Body className="small px-3 py-3">
                <p
                  className="mb-2"
                  style={{
                    lineHeight: "1.4",
                    fontSize: "0.85rem",
                  }}
                >
                  Provide a custom name for each selected file as it will be
                  referenced in the workflow. This name is used within the
                  workflow to identify the file.
                </p>

                <ul
                  className="mt-2 ps-3"
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <li>
                    Must start with <code>letter</code>
                  </li>
                  <li>
                    Should not contain <code>spaces</code>
                  </li>
                  <li>
                    Should not contain <code>paths</code>
                  </li>
                  <li>
                    Should not contain <code>special characters</code> except
                    for <code>_</code>
                  </li>
                  <li>Must be unique among all file inputs</li>
                </ul>

                <hr className="my-3" />

                <div
                  className="fw-semibold mb-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  Valid Examples
                  <FontAwesomeIcon
                    icon={faSquareCheck}
                    className="ms-2 text-success"
                  />
                </div>
                <div
                  className="bg-light border rounded px-2 py-2 mb-3"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  file1 <br />
                  file_1 <br />
                  myFile
                </div>

                <div
                  className="fw-semibold mb-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  Not Allowed
                  <FontAwesomeIcon
                    icon={faSquareXmark}
                    className="ms-2 text-danger"
                  />
                </div>
                <div
                  className="bg-light border rounded px-2 py-2"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  1file <br />
                  _file <br />
                  my file <br />
                  file1.txt <br />
                  /path/to/file <br />
                </div>
              </Popover.Body>
            </Popover>
          }
        >
          {/* <Button variant="outline-secondary border-0 p-1" size="sm"> */}
          <FontAwesomeIcon icon={faInfoCircle} className="color-primary" />
          {/* </Button> */}
        </OverlayTrigger>
      </div>
      <small className="text-muted">
        Provide a unique name for each selected file as it will be referenced in
        the workflow.
      </small>

      <Form.Group className="mt-3">
        {selectedFiles?.map((file, index) => (
          <div key={index} className="mb-2">
            <InputGroup>
              <InputGroup.Text className="bg-light">
                File {index + 1}
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={file?.name || ""}
                placeholder="Enter file name"
                onChange={(e) => handleFileNameChange(index, e.target.value)}
                required={selectedFiles?.length > 0}
                isValid={
                  validateFileName(file?.name) === "" &&
                  validateUniqueFileNames(selectedFiles)
                }
                isInvalid={
                  validateFileName(file?.name) !== "" ||
                  !validateUniqueFileNames(selectedFiles)
                }
              />

              <Form.Control.Feedback type="invalid">
                {validateFileName(file?.name) !== ""
                  ? validateFileName(file?.name)
                  : !validateUniqueFileNames(selectedFiles)
                  ? "File names must be unique."
                  : ""}
              </Form.Control.Feedback>
            </InputGroup>
          </div>
        ))}
      </Form.Group>
    </div>
  );
}
