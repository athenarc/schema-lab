import React, { createContext, useContext, useEffect, useState } from "react";
import { listTasks, listWorkflowTasks } from "../../api/v1/actions";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";
import { useClientPreferences } from "../../client/ClientPreferencesProvider";

export const TasksContext = createContext();

export const useTaskData = (showWorkflowTasks) => {
    const { taskData, setTaskData, fetchTaskData, taskFilters } = useContext(TasksContext);
    
    useEffect(() => {
        fetchTaskData(showWorkflowTasks);
    }, [showWorkflowTasks, taskFilters]);

    return { taskData, setTaskData };
};

export const useTaskFilters = () => {
    const { taskFilters, setTaskFilters, selectedTasks, setSelectedTasks } = useContext(TasksContext);
    return { taskFilters, setTaskFilters, selectedTasks, setSelectedTasks };
};

const TasksListProvider = ({ children }) => {
    const { clientPreferences } = useClientPreferences();
    const { pageSize } = clientPreferences;

    const [taskData, setTaskData] = useState(null);
    const [taskFilters, setTaskFilters] = useState({
        token: "",
        statuses: {},
        order: "-submitted_at",
        page: 0,
    });

    const [selectedTasks, setSelectedTasks] = useState([]);
    const { userDetails } = useContext(UserDetailsContext);

    const fetchTaskData = (isWorkflowTasks) => {
        const filters = {
            ...taskFilters,
            statuses: Object.keys(taskFilters.statuses).filter((k) => taskFilters.statuses[k]),
            view: "detailed",
            limit: pageSize,
            offset: taskFilters.page * pageSize,
        };

        const fetchFunction = isWorkflowTasks ? listWorkflowTasks : listTasks;

        fetchFunction({ filters, auth: userDetails.apiKey })
            .then((response) => response.ok && response.json())
            .then((data) => {
                setTaskData({ count: data.count, results: data.results });
            })
            .catch(error => {
                console.error("Error fetching task data:", error);
            });
    };

    useEffect(() => {
    }, [taskFilters]);

    return (
        <TasksContext.Provider 
            value={{ 
                taskData, 
                setTaskData, 
                taskFilters, 
                setTaskFilters, 
                selectedTasks, 
                setSelectedTasks, 
                fetchTaskData 
            }}
        >
            {children}
        </TasksContext.Provider>
    );
};

export default TasksListProvider;