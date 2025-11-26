import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { listTasks, listWorkflowTasks } from "../../api/v1/actions";
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";
import { useClientPreferences } from "../../client/ClientPreferencesProvider";

export const TasksContext = createContext();

export const useTaskData = (showWorkflowTasks) => {
    const { taskData, fetchTaskData, taskFilters, isWorkflowView } = useContext(TasksContext);
    
    useEffect(() => {
        // Only fetch if the view type changes or if it's the initial render
        if (showWorkflowTasks !== isWorkflowView) {
            fetchTaskData(showWorkflowTasks, true);
        }
    }, [showWorkflowTasks, isWorkflowView, fetchTaskData]);

    return { taskData };
};

export const useTaskFilters = () => {
    const { taskFilters, setTaskFilters, selectedTasks, setSelectedTasks, isWorkflowView } = useContext(TasksContext);
    return { taskFilters, setTaskFilters, selectedTasks, setSelectedTasks, isWorkflowView };
};

const TasksListProvider = ({ children, initialFilters = {} }) => {
    const { clientPreferences } = useClientPreferences();
    const { pageSize } = clientPreferences;

    const [taskData, setTaskData] = useState(null);
    const [taskFilters, setTaskFilters] = useState({
        token: "",
        statuses: {},
        order: "-submitted_at",
        page: 0,
        ...initialFilters,
    });
    const [isWorkflowView, setIsWorkflowView] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { userDetails } = useContext(UserDetailsContext);
    const refreshInterval = 3000;
    const intervalIdRef = useRef(null);
    
    // Track if filters changed via a ref to avoid re-renders
    const previousFiltersRef = useRef(taskFilters);

    // Fetch task data without causing unnecessary re-renders
    const fetchTaskData = useCallback((isWorkflowTasks = isWorkflowView, resetPage = false) => {
        setIsLoading(true);
        
        // Create a local copy of filters to use
        let filtersToUse = { ...taskFilters };
        
        // Reset page if needed
        if (resetPage && isWorkflowTasks !== isWorkflowView) {
            filtersToUse = { ...filtersToUse, page: 0 };
            setTaskFilters(filtersToUse);
        }
        
        // Update view type state
        setIsWorkflowView(isWorkflowTasks);
        
        const requestFilters = {
            ...filtersToUse,
            statuses: Object.keys(filtersToUse.statuses).filter((k) => filtersToUse.statuses[k]),
            view: "detailed",
            limit: pageSize,
            offset: filtersToUse.page * pageSize,
        };

        const fetchFunction = isWorkflowTasks ? listWorkflowTasks : listTasks;

        fetchFunction({ filters: requestFilters, auth: userDetails.apiKey })
            .then((response) => response.ok ? response.json() : Promise.reject("Failed to fetch tasks"))
            .then((data) => {
                setTaskData({ count: data.count, results: data.results });
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching task data:", error);
                setIsLoading(false);
            });
    }, [pageSize, taskFilters, isWorkflowView, userDetails.apiKey]);
    
    // Set up polling interval
    useEffect(() => {
        // Set up polling
        const setupPolling = () => {
            // Clear any existing interval
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
            
            // Initial fetch
            fetchTaskData();
            
            // Set up new interval
            intervalIdRef.current = setInterval(() => {
                fetchTaskData();
            }, refreshInterval);
        };
        
        setupPolling();
        
        // Cleanup function
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, [fetchTaskData, refreshInterval]);
    
    // Handle filter changes
    useEffect(() => {
        // Only fetch if filters actually changed - deep compare
        const filtersChanged = JSON.stringify(previousFiltersRef.current) !== JSON.stringify(taskFilters);
        
        if (filtersChanged) {
            fetchTaskData();
            previousFiltersRef.current = taskFilters;
        }
    }, [taskFilters, fetchTaskData]);

    const contextValue = {
        taskData,
        setTaskData,
        taskFilters,
        setTaskFilters,
        selectedTasks,
        setSelectedTasks,
        fetchTaskData,
        isWorkflowView,
        isLoading
    };

    return (
        <TasksContext.Provider value={contextValue}>
            {children}
        </TasksContext.Provider>
    );
};

export default TasksListProvider;