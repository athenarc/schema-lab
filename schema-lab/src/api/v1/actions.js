import config from "../../config"

const getTasks = (limit, offset) => {

    fetch(`${config.api.url}/api/v1/test`,)
}

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
    const qualifiedUrl=[`${config.api.url}/api/test`, queryParameters.join("&")].join("?");
    return fetch(
        qualifiedUrl,
        {
            method: "GET",
            headers
        }
    );
}

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