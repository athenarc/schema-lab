import React, { createContext, useContext, useEffect, useState } from "react";
import { getExperiments } from "../../../../api/v1/actions";
import { UserDetailsContext } from "../../../../utils/components/auth/AuthProvider";
import { useClientPreferences } from "../../../../client/ClientPreferencesProvider";

export const ExperimentsContext = createContext();

export const useExperimentsData = () => {
    const { ExperimentData } = useContext(ExperimentsContext);
    return { ExperimentData };
};

export const useExperimentFilters = () => {
    const { ExperimentFilters, setExperimentFilters } = useContext(ExperimentsContext);
    return { ExperimentFilters, setExperimentFilters };
};

const ExperimentsProvider = ({ children }) => {
    const { clientPreferences } = useClientPreferences();
    const { pageSize } = clientPreferences;
    const [ExperimentData, setExperimentData] = useState({ count: 0, results: [] });
    const [ExperimentFilters, setExperimentFilters] = useState({
        token: "",
        page: 0,
        order: "-created_at", // curently, not working
    });

    const { userDetails } = useContext(UserDetailsContext);
    const refreshInterval = 3000;

    const fetchExperimentData = () => {
        const filters = {
            ...ExperimentFilters,
            view: "detailed",
            limit: pageSize, 
        };

        getExperiments({
            filters,
            auth: userDetails.apiKey,
        })
            .then((data) => {
                if (data && data.results) {
                    const filteredResults = data.results.filter((experiment) => {
                        return experiment.name
                            .toLowerCase()
                            .includes(ExperimentFilters.token.toLowerCase());
                    });
                    // Apply sorting
                    const sortedResults = [...filteredResults].sort((a, b) => {
                        const dateA = new Date(a.created_at);
                        const dateB = new Date(b.created_at);

                        if (ExperimentFilters.order === "-created_at") {
                            return dateB - dateA; // Descending order
                        } else {
                            return dateA - dateB; // Ascending order
                        }
                    });

                    // Paginate sorted data
                    const paginatedResults = sortedResults.slice(
                        ExperimentFilters.page * pageSize,
                        (ExperimentFilters.page + 1) * pageSize
                    );

                    setExperimentData({
                        count: sortedResults.length,
                        results: paginatedResults,
                    });
                } else {
                    console.error("Unexpected data format:", data);
                    setExperimentData({ count: 0, results: [] });
                }
            })
            .catch((error) => {
                console.error("Error fetching experiments:", error);
                setExperimentData({ count: 0, results: [] });
            });
    };

    useEffect(() => {
        fetchExperimentData();
    }, [ExperimentFilters]);

    useEffect(() => {
        const intervalId = setInterval(fetchExperimentData, refreshInterval);
        return () => clearInterval(intervalId);
    }, [ExperimentFilters]);

    return (
        <ExperimentsContext.Provider value={{ ExperimentData, setExperimentData, ExperimentFilters, setExperimentFilters }}>
            {children}
        </ExperimentsContext.Provider>
    );
};

export default ExperimentsProvider;