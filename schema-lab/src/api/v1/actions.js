import config from "../../config"

export const listTasks = options => {
    let queryParameters = [];
    let headers = {};
    if (options) {
        if (options.filters) {
            if (options.filters.view) queryParameters.push(`view=${options.filters.view}`);
            if (options.filters.order) queryParameters.push(`order=${options.filters.order}`);
            if (options.filters.token) queryParameters.push(`search=${options.filters.token}`);
            if (options.filters.statuses) {
                options.filters.statuses.forEach(status => queryParameters.push(`status=${status.toUpperCase()}`));
            }
            if (options.filters.limit) queryParameters.push(`limit=${options.filters.limit}`);
            if (options.filters.offset) queryParameters.push(`offset=${options.filters.offset}`);
        }
        if (options.auth) {
            headers["Authorization"] = `Bearer ${options.auth}`;
        }
    }
    const qualifiedUrl=[`${config.api.url}/api/tasks`, queryParameters.join("&")].join("?");
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers
        }
    );
}

// Get Task details
export const retrieveTaskDetails = ({taskUUID, auth}) => {
    const qualifiedUrl=`${config.api.url}/api/tasks/${taskUUID}`
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Response status:', response.status);
        return response;
    });
}

// Get project name from ipatia
export const getProjectName = (auth) => {
    const qualifiedUrl=`${config.api.url}/api/context-info`
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Project name response status:', response.status);
        return response;
    });
}

export const runTaskPost = async (apiKey, requestData) => {
    try {
        console.log("Raw JSON Single payload:", JSON.stringify(requestData, null, 2)); // Pretty-print JSON

        const response = await fetch(`${config.api.url}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });
        if (!response.ok) {
            // Handle errors based on response status
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;
    }
};


// Cancel a running task
export const cancelTaskPost = ({taskUUID, auth}) => {
    const qualifiedUrl=`${config.api.url}/api/tasks/${taskUUID}/cancel`
    return fetch(
        qualifiedUrl,
        {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Cancel request response status:', response.status);
        return response;
    });
}


// Get Experiments
export const getExperiments = options => {
    let queryParameters = [];
    let headers = {};

    if (options) {
        if (options.filters) {
            if (options.filters.view) queryParameters.push(`view=${options.filters.view}`);
            if (options.filters.order) queryParameters.push(`order=${options.filters.order}`);
            if (options.filters.token) queryParameters.push(`search=${options.filters.token}`);
            if (options.filters.limit) queryParameters.push(`limit=${options.filters.limit}`);
            if (options.filters.offset) queryParameters.push(`offset=${options.filters.offset}`);
        }
        if (options.auth) {
            headers["Authorization"] = `Bearer ${options.auth}`;
        }
    }

    const queryString = queryParameters.length ? `?${queryParameters.join("&")}` : '';
    const qualifiedUrl = `${config.api.url}/reproducibility/experiments${queryString}`;

    return fetch(qualifiedUrl, {
        method: "GET",
        headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch experiments: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (Array.isArray(data)) {
            return {
                count: data.length,
                results: data
            };
        }
        return data;
    })
    .catch(error => {
        console.error('Error fetching experiments:', error);
        return { count: 0, results: [] };
    });
};


// Get Experiment details
export const getExperimentDetails = ({creator, name, auth}) => {
    const qualifiedUrl=`${config.api.url}/reproducibility/experiments/${creator}/${name}`
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Response status:', response.status);
        return response;
    });
}


// Post Experiment
export const postExperiment = async (apiKey, requestData) => {
    try {
        const response = await fetch(`${config.api.url}/reproducibility/experiments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            // Check for 409 Conflict status code (name already exists)
            if (response.status === 409) {
                throw new Error("Experiment name already exists. Please choose a different name.");
            }
            // Handle other errors based on response status
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;
    }
};


// Put Experiment task details
export const putExperimentTasks = async (apiKey, creator, name, uuid) => {
    try {
        const response = await fetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}/tasks`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(uuid)
        });
        
        if (!response.ok) {
            // Handle errors based on response status
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;
    }
};


// Get task details for experiment
export const getExperimentTaskDetails = ({creator, name, auth}) => {
    const qualifiedUrl=`${config.api.url}/reproducibility/experiments/${creator}/${name}/tasks`
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Response status:', response.status);
        return response;
    });
}


// Get task details for experiment
export const deleteExperiment = ({creator, name, auth}) => {
    const qualifiedUrl=`${config.api.url}/reproducibility/experiments/${creator}/${name}`
    return fetch(
        qualifiedUrl,
        {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Response status:', response.status);
        return response;
    });
}


// Edit an experiment
export const editExperiment = async (creator, name, apiKey, experimentdata) => {
    try {
        const response = await fetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(experimentdata)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
        }
        
        return response;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;
    }
};


// POST a workflow task
export const runWorkflowTaskPost = async (apiKey, requestData) => {
    try {
        const response = await fetch(`${config.api.url}/api/workflows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            // Handle errors based on response status
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Error during post workflow:', error);
        throw error;
    }
};

// List workflow tasks
export const listWorkflowTasks = options => {
    let queryParameters = [];
    let headers = {};
    if (options) {
        if (options.filters) {
            if (options.filters.view) queryParameters.push(`view=${options.filters.view}`);
            if (options.filters.order) queryParameters.push(`order=${options.filters.order}`);
            if (options.filters.token) queryParameters.push(`search=${options.filters.token}`);
            if (options.filters.statuses) {
                options.filters.statuses.forEach(status => queryParameters.push(`status=${status.toUpperCase()}`));
            }
            if (options.filters.limit) queryParameters.push(`limit=${options.filters.limit}`);
            if (options.filters.offset) queryParameters.push(`offset=${options.filters.offset}`);
        }
        if (options.auth) {
            headers["Authorization"] = `Bearer ${options.auth}`;
        }
    }
    const qualifiedUrl=[`${config.api.url}/api/workflows`, queryParameters.join("&")].join("?");
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers
        }
    );
}


// Get workflow Task details
export const retrieveWorkflowTaskDetails = ({taskUUID, auth}) => {
    const qualifiedUrl=`${config.api.url}/api/workflows/${taskUUID}`
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Response status:', response.status);
        return response;
    });
}

// Cancel a workflow running task
export const cancelWorkflowTaskPost = ({taskUUID, auth}) => {
    const qualifiedUrl=`${config.api.url}/api/workflows/${taskUUID}/cancel`
    return fetch(
        qualifiedUrl,
        {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }
    ).then(response => {
        console.log('Cancel request response status:', response.status);
        return response;
    });
}
