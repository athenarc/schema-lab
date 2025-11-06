import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";

export function FileListControls({
  searchTerm,
  setSearchTerm,
  allSelected,
  handleSelectAll,
  handleClearSelection,
}) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-3 gap-2 border-bottom pb-3">
      <div className="flex-grow-1 me-md-2" style={{ minWidth: 0 }}>
        <InputGroup>
          <InputGroup.Text className="bg-light">
            <FontAwesomeIcon icon={faSearch} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search files in the folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </InputGroup>
      </div>

      <div className="d-flex gap-2 mt-2 mt-md-0 flex-shrink-0">
        <Button
          variant={allSelected ? "outline-secondary" : "outline-primary"}
          onClick={handleSelectAll}
        >
          <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
        <Button variant="outline-danger" onClick={handleClearSelection}>
          <FontAwesomeIcon icon={faSquareXmark} className="me-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
