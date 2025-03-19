import React from "react";
import Pagination from "react-bootstrap/Pagination";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useTaskFilters, useTaskData } from "./TasksListProvider";
import { cloneDeep } from "lodash";
import { useClientPreferences } from "../../client/ClientPreferencesProvider";

const TasksPaginationControls = () => {
    const { taskFilters, setTaskFilters } = useTaskFilters();
    const { taskData } = useTaskData();
    const { clientPreferences } = useClientPreferences();
    if (taskData) {
        const setCurrent = i => {
            const newState = cloneDeep(taskFilters);
            newState.page = i;
            setTaskFilters(newState);
        };
        const currentPageIndex = taskFilters.page;
        const { pageSize } = clientPreferences
        const { count } = taskData;
        const maxPageIndex = Math.ceil(count / pageSize)-1;
        const paginationItems = [];
        for (let i = Math.max(0, currentPageIndex - 2); i <= Math.min(currentPageIndex + 2, maxPageIndex); i++) {
            paginationItems.push(<Pagination.Item key={i} active={currentPageIndex === i} onClick={() => { setCurrent(i) }}>{i + 1}</Pagination.Item>);
        }

        return <Row className="p-3 justify-content-between">
            <Col className="d-flex justify-content-start align-items-start">
                {count > pageSize
                    ? <small>Displaying tasks {(currentPageIndex * pageSize) + 1}-{Math.min((currentPageIndex + 1) * pageSize, count)}, out of {count} total</small>
                    //: <small>Search results: {count} total tasks</small>
                    : <small>Displaying tasks {(currentPageIndex * pageSize) + 1}-{Math.min((currentPageIndex + 1) * pageSize, count)}, out of {count} total</small>
                }
            </Col>
            <Col className="d-flex justify-content-end align-items-start">
                <Pagination>
                    {currentPageIndex > 2 && <Pagination.First onClick={() => { setCurrent(0) }} />}
                    {paginationItems.length > 0 && paginationItems} 
                    {maxPageIndex - currentPageIndex > 2 && <Pagination.Last onClick={() => { setCurrent(maxPageIndex) }} />}
                </Pagination>
            </Col>
        </Row>
    } 

    return;
}

export default TasksPaginationControls;