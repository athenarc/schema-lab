import React from "react";
import Pagination from "react-bootstrap/Pagination";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useExperimentFilters, useExperimentsData } from "./preview/ExperimentsProvider";
import { useClientPreferences } from "../../../client/ClientPreferencesProvider";

const ExperimentsPaginationControls = () => {
    const { ExperimentFilters, setExperimentFilters } = useExperimentFilters();
    const { ExperimentData } = useExperimentsData();
    const { clientPreferences } = useClientPreferences();

    const { pageSize } = clientPreferences;
    const { count = 0, results = [] } = ExperimentData || {};  

    const currentPageIndex = ExperimentFilters.page;
    const maxPageIndex = Math.ceil(count / pageSize) - 1;

    const paginationItems = [];

    const setCurrent = (i) => {
        const newState = { ...ExperimentFilters, page: i };
        setExperimentFilters(newState);  // Update the filters to trigger data fetch
    };

    for (let i = Math.max(0, currentPageIndex - 2); i <= Math.min(currentPageIndex + 2, maxPageIndex); i++) {
        paginationItems.push(
            <Pagination.Item key={i} active={currentPageIndex === i} onClick={() => setCurrent(i)}>
                {i + 1}
            </Pagination.Item>
        );
    }

    return (
        <Row className="p-3 justify-content-between">
            <Col className="d-flex justify-content-start align-items-start">
                {count > pageSize
                    ? <small>Displaying experiments {(currentPageIndex * pageSize) + 1}-{Math.min((currentPageIndex + 1) * pageSize, count)}, out of {count} total</small>
                    : <small>Search results: {count} total experiments</small>
                }
            </Col>
            <Col className="d-flex justify-content-end align-items-start">
                <Pagination>
                    {currentPageIndex > 2 && <Pagination.First onClick={() => setCurrent(0)} />}
                    {paginationItems.length > 0 && paginationItems} 
                    {maxPageIndex - currentPageIndex > 2 && <Pagination.Last onClick={() => setCurrent(maxPageIndex)} />}
                </Pagination>
            </Col>
        </Row>
    );
};

export default ExperimentsPaginationControls;
