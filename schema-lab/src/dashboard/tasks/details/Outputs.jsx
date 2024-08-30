import React from 'react';
import { Table, Alert, Card } from 'react-bootstrap';
import { useTaskDetails } from './TaskListDetails';

const Outputs = () => {
    const taskDetails = useTaskDetails();

    return (
        <div>
            <Card className="mt-1">
                <Card.Body className='pb-0'>
                    {taskDetails && taskDetails.outputs && taskDetails.outputs.length > 0 ? (
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr className="text-center">
                                <th className="col-0">ID</th>
                                <th>URL</th>
                                <th>Path</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskDetails.outputs.map((input, index) => (
                                <tr className="text-center" key={index}>
                                    <td>{index}</td>
                                    <td>{input.url}</td> 
                                    <td>{input.path}</td>
                                    <td>{input.type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    ) : (
                        <Alert variant="warning" className="mt-0">
                            Sorry, this task has no outputs!
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Outputs;