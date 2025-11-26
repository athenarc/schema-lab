import {
  Form,
  Row,
  Col,
  OverlayTrigger,
  InputGroup,
  Popover,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareCheck,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function FileContainerInputField({
  containerInputsPath,
  selectedFiles,
  handleContainerInputsPathChange,
}) {
  return (
    <div>
      <div className="mb-4">
        <div className="d-flex gap-1 mb-1">
          <h6 className="fw-semibold mb-1">Container Input Path</h6>
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
                  Container Input Path Rules
                </Popover.Header>

                <Popover.Body className="small px-3 py-3">
                  <p
                    className="mb-2"
                    style={{
                      lineHeight: "1.4",
                      fontSize: "0.85rem",
                    }}
                  >
                    Select a directory inside the task's container where your
                    selected files will be mounted.
                  </p>

                  <ul
                    className="mt-2 ps-3"
                    style={{
                      marginBottom: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <li>
                      Must start with <code>/</code>
                    </li>
                    <li>
                      Should end with <code>/</code> when referring to a
                      directory
                    </li>
                    <li>
                      Should not contain <code>.</code> characters
                    </li>
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
                    /inputs/ <br />
                    /workspace/data/ <br />
                    /mnt/data/custom/
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
                    inputs <br />
                    /inputs <br />
                    /data/file.txt <br />
                    /data/../secret
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </OverlayTrigger>
        </div>
        <small className="text-muted">
          Files you select will be placed inside the task’s container at this
          path. Choose a location carefully to avoid unintended overwrites.
        </small>
      </div>

      <Form.Group as={Row} className="align-items-start mb-4">
        <Form.Label column sm="3" className="fw-bold pt-2">
          Path <span className="text-danger">*</span>
        </Form.Label>

        <Col sm="8">
          <InputGroup>
            <Form.Control
              type="text"
              name="path"
              value={containerInputsPath?.path}
              onChange={(e) => handleContainerInputsPathChange(e.target.value)}
              onBlur={(e) => {
                handleContainerInputsPathChange(e.target.value);
              }}
              placeholder="/inputs/"
              isInvalid={
                !containerInputsPath?.isValid && !!selectedFiles?.length
              }
              required={!!selectedFiles?.length}
            />

            {/* Popover Help Button */}

            <Form.Control.Feedback type="invalid">
              {containerInputsPath?.errorMsg}
            </Form.Control.Feedback>
          </InputGroup>

          {/* Show warning only if user has selected files */}
          {selectedFiles?.length > 0 && (
            <div className="alert alert-warning mt-3 mb-0 py-2 px-3 d-flex align-items-center gap-2 small">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <span>
                Files copied to this location may <strong>overwrite</strong>{" "}
                existing files in the container.
              </span>
            </div>
          )}
        </Col>
      </Form.Group>
    </div>
  );
}
