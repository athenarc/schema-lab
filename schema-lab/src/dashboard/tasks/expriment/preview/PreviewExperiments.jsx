import React, { useState, useContext } from "react";
import { useExperimentsData, useExperimentFilters } from "./ExperimentsProvider";
import { Row, Col, Table, DropdownButton, Dropdown, OverlayTrigger, Tooltip, Modal, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownAZ, faArrowDownZA } from "@fortawesome/free-solid-svg-icons";
import { deleteExperiment } from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";

const ExperimentListing = ({ name, creator, created_at, onActionSelect }) => (
    <tr>
        <td className="text-center">
            <Link to={`/experiment-details/${creator}/${name}/description`}>{name}</Link>
        </td>
        <td className="text-center">{creator}</td>
        <td className="text-center">{new Date(created_at).toLocaleString("en")}</td>
        <td className="text-center">
            <OverlayTrigger
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-${name}`}>
                        Select an action for this experiment.
                    </Tooltip>
                }
                >
                <DropdownButton
                    variant="primary"
                    size="sm"
                    title="Select..."
                    drop="auto"
                    renderMenuOnMount
                    container="body"
                    onSelect={(action) => onActionSelect(action, { name, creator })}
                >
                    <Dropdown.Item eventKey="edit">Edit</Dropdown.Item>
                    <Dropdown.Item eventKey="delete">Delete</Dropdown.Item>
                    <Dropdown.Item eventKey="export" disabled>
                        Export RO-crates
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="publish" disabled>
                        Publish RO-hub
                    </Dropdown.Item>
                </DropdownButton>
            </OverlayTrigger>
        </td>
    </tr>
);


const ColumnOrderToggle = ({ columnName, currentOrder, setOrder }) => {
    const isActive = currentOrder && currentOrder.endsWith(columnName);
    const isAsc = currentOrder && !currentOrder.startsWith("-"); // Ascending order is without a leading "-"
    const icon = isActive && isAsc ? faArrowDownZA : faArrowDownAZ;

    const handleToggle = () => {
        // Toggle the order based on the current state
        setOrder(isActive && isAsc ? `-${columnName}` : columnName);
    };

    return (
        <span
            role="button"
            className={`fw-bold ${isActive ? "text-primary" : "text-muted"}`}
            onClick={handleToggle}
        >
            <FontAwesomeIcon icon={icon} />
        </span>
    );
};

const PreviewExperiments = () => {
    const { ExperimentData } = useExperimentsData();
    const { ExperimentFilters, setExperimentFilters } = useExperimentFilters();
    const [searchName, setSearchName] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [experimentToDelete, setExperimentToDelete] = useState(null);
    const { userDetails } = useContext(UserDetailsContext);
    const navigate = useNavigate();

    const handleSearchInput = (evt) => setSearchName(evt.target.value);

    const applyFilters = (evt) => {
        if (evt.key === "Enter" && searchName.length >= 2) {            
            setExperimentFilters({ ...ExperimentFilters, token: searchName, page: 0 });
        }
    };

    const restoreFilters = (evt) => {
        if (evt.target.value === "") {
            setExperimentFilters({ ...ExperimentFilters, token: "" });
        }
    };

    const onActionSelect = async (action, { name, creator }) => {
        if (action === "delete") {
            setExperimentToDelete({ name, creator });
            setShowDeleteConfirmation(true);
        }
        if (action === "edit") {
            navigate(`/edit/${creator}/${name}`);
        }
    };

    const handleDelete = async () => {
        if (experimentToDelete) {
            const { name, creator } = experimentToDelete;
            try {
                const response = await deleteExperiment({
                    creator,
                    name,
                    auth: userDetails.apiKey,
                });
                if (response.ok) {
                    setShowDeleteConfirmation(false);
                }
            } catch (error) {
                console.error("Error deleting the experiment:", error);
            }
        }
    };


    const filteredData = ExperimentData.results
        .sort((a, b) => {
            const order = ExperimentFilters.order;
            const isDescending = order && order.startsWith("-");
            const key = order && order.startsWith("-") ? order.substring(1) : order;

            if (key === "created_at") {
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);

                return isDescending ? dateB - dateA : dateA - dateB;
            }

            return 0;
        });

    return (
        <Row className="p-3 mb-5">
            <Col>
                <Table borderless responsive hover>
                    <thead>
                        <tr>
                            <th className="text-center col-4">
                                <div className="input-group">
                                    <span className="input-group-text fw-bold">
                                        Name
                                    </span>
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={<Tooltip>Type at least 2 characters and push Enter.</Tooltip>}
                                    >
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={searchName}
                                            onInput={handleSearchInput}
                                            onKeyDown={applyFilters}
                                            onChange={restoreFilters}
                                            placeholder="Search..."
                                        />
                                    </OverlayTrigger>
                                </div>
                            </th>
                            <th className="text-center">Creator</th>
                            <th className="text-center">
                                Created At&nbsp;
                                <ColumnOrderToggle
                                    columnName="created_at"
                                    currentOrder={ExperimentFilters.order}
                                    setOrder={(newOrder) =>
                                        setExperimentFilters({ ...ExperimentFilters, order: newOrder })
                                    }
                                />
                            </th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(({ name, creator, created_at }) => (
                            <ExperimentListing
                                key={`${creator}-${name}`}
                                name={name}
                                creator={creator}
                                created_at={created_at}
                                onActionSelect={onActionSelect}
                            />
                        ))}
                    </tbody>
                </Table>
            </Col>
            {filteredData.length === 0 && searchName.length >= 2 && (
                <div className="alert alert-warning text-center">
                    No experiments match <b>{searchName}</b> your search criteria.
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this experiment?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default PreviewExperiments;
