import React, { createContext, useState, useEffect } from 'react';

export const UserDetailsContext = createContext({});

const AuthProvider = props => {
    // Initialize userDetails synchronously from localStorage if available
    const getInitialUserDetails = () => {
        try {
            const storedUser = localStorage.getItem('userDetails');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.apiKey) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Error loading user details:', error);
        }
        return null;
    };

    const [userDetails, setUserDetails] = useState(getInitialUserDetails);
    const [loading, setLoading] = useState(false);

    // Persist userDetails when they change
    useEffect(() => {
        if (userDetails) {
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
        } else {
            localStorage.removeItem('userDetails');
        }
    }, [userDetails]);

    return (
        <UserDetailsContext.Provider value={{ userDetails, setUserDetails, loading }}>
            {props.children}
        </UserDetailsContext.Provider>
    );
};

export default AuthProvider;