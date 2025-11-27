import config from "../../config";

export const apiFetch = async (url, options = {}, navigate = () => {}) => {
    try {
        const response = await fetch(url, options);

        if (response.status === 403) {
            const data = await safeParseJSON(response);
            const message = data?.reason;

            navigate("/");
            throw new Error(message);
        }

        return response;
    } catch (err) {
        throw err;
    }
};

// Safe JSON parsing helper
const safeParseJSON = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};


export const listTasks = (options = {}) => {
    const headers = options.auth ? { Authorization: `Bearer ${options.auth}` } : {};
    const queryParameters = [];

    const filters = options.filters || {};
    if (filters.view) queryParameters.push(`view=${filters.view}`);
    if (filters.order) queryParameters.push(`order=${filters.order}`);
    if (filters.token) queryParameters.push(`search=${filters.token}`);
    if (filters.statuses) queryParameters.push(...filters.statuses.map(s => `status=${s.toUpperCase()}`));
    if (filters.limit) queryParameters.push(`limit=${filters.limit}`);
    if (filters.offset) queryParameters.push(`offset=${filters.offset}`);

    const queryString = queryParameters.length ? `?${queryParameters.join("&")}` : "";
    return apiFetch(`${config.api.url}/api/tasks${queryString}`, {
        method: "GET",
        headers
    });
};

export const retrieveTaskDetails = ({ taskUUID, auth }) => {
    return apiFetch(`${config.api.url}/api/tasks/${taskUUID}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` }
    });
};

export const runTaskPost = (apiKey, requestData) => {
    return apiFetch(`${config.api.url}/api/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });
};

export const cancelTaskPost = ({ taskUUID, auth }) => {
    return apiFetch(`${config.api.url}/api/tasks/${taskUUID}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth}` }
    });
};

// -------------------------------------------
// Experiments Endpoints
// -------------------------------------------
export const getExperiments = (options = {}) => {
    const headers = options.auth ? { Authorization: `Bearer ${options.auth}` } : {};
    const filters = options.filters || {};
    const queryParameters = [];

    if (filters.view) queryParameters.push(`view=${filters.view}`);
    if (filters.order) queryParameters.push(`order=${filters.order}`);
    if (filters.token) queryParameters.push(`search=${filters.token}`);
    if (filters.limit) queryParameters.push(`limit=${filters.limit}`);
    if (filters.offset) queryParameters.push(`offset=${filters.offset}`);

    const queryString = queryParameters.length ? `?${queryParameters.join("&")}` : "";
    return apiFetch(`${config.api.url}/reproducibility/experiments${queryString}`, {
        method: "GET",
        headers
    })
    .then(response => response.json())
    .then(data => Array.isArray(data) ? { count: data.length, results: data } : data);
};

export const getExperimentDetails = ({ creator, name, auth }) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` }
    });
};

export const postExperiment = (apiKey, requestData) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    }).then(async response => {
        if (response.status === 409) {
            throw new Error("Experiment name already exists. Please choose a different name.");
        }
        return response.json();
    });
};

export const putExperimentTasks = (apiKey, creator, name, uuid) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}/tasks`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(uuid)
    });
};

export const getExperimentTaskDetails = ({ creator, name, auth }) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}/tasks`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` }
    });
};

export const getExperimentWorkflowDetails = ({ creator, name, auth }) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}/workflows`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` }
    });
};


export const putExperimentWorkflows = (apiKey, creator, name, uuid) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}/workflows`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(uuid)
    });
};

export const deleteExperiment = ({ creator, name, auth }) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth}` }
    });
};

export const editExperiment = (creator, name, apiKey, experimentData) => {
    return apiFetch(`${config.api.url}/reproducibility/experiments/${creator}/${name}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(experimentData)
    }).then(async response => {
        if (!response.ok) {
            const errorData = await safeParseJSON(response);
            throw new Error(`Error ${response.status}: ${errorData?.message || response.statusText}`);
        }
        return response;
    });
};


export const runWorkflowTaskPost = (apiKey, requestData) => {
    return apiFetch(`${config.api.url}/api/workflows`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });
};

export const listWorkflowTasks = (options = {}) => {
    const headers = options.auth ? { Authorization: `Bearer ${options.auth}` } : {};
    const filters = options.filters || {};
    const queryParameters = [];

    if (filters.view) queryParameters.push(`view=${filters.view}`);
    if (filters.order) queryParameters.push(`order=${filters.order}`);
    if (filters.token) queryParameters.push(`search=${filters.token}`);
    if (filters.statuses) queryParameters.push(...filters.statuses.map(s => `status=${s.toUpperCase()}`));
    if (filters.limit) queryParameters.push(`limit=${filters.limit}`);
    if (filters.offset) queryParameters.push(`offset=${filters.offset}`);

    const queryString = queryParameters.length ? `?${queryParameters.join("&")}` : "";
    return apiFetch(`${config.api.url}/api/workflows${queryString}`, {
        method: "GET",
        headers
    });
};

export const retrieveWorkflowTaskDetails = ({ taskUUID, auth }) => {
    return apiFetch(`${config.api.url}/api/workflows/${taskUUID}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` }
    });
};

export const cancelWorkflowTaskPost = ({ taskUUID, auth }) => {
    return apiFetch(`${config.api.url}/api/workflows/${taskUUID}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth}` }
    });
};


export const getProjectName = (auth) => {
    return apiFetch(`${config.api.url}/api/context-info`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` }
    });
};
