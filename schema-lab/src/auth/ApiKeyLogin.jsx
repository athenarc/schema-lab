import React, { useContext, useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Form from "react-bootstrap/Form";
import Alert from 'react-bootstrap/Alert';
import { UserDetailsContext } from "../utils/components/auth/AuthProvider";
import { getProjectName } from "../api/v1/actions";

const ApiKeyLogin = props => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState(''); 
    const { userDetails, setUserDetails } = useContext(UserDetailsContext);


    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            setError("");
        }, 4000);

        return () => clearTimeout(timer);
    }, [error]);

    const validateApiKey = async (key) => {
        try {
            const response = await getProjectName(key);

            if (response.ok) {
                return null;
            }

            const data = await response.json();
            return data?.reason;

        } catch (err) {
            return err?.message;
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");

        const errorReason = await validateApiKey(apiKey);
       
        if (errorReason) {
            setError(errorReason);
            return;
        }

        setUserDetails({
            apiKey,
            type: "apiKey"
        });
    };

    if (userDetails) {
        return <span>Already logged in</span>;
    }

    return (
        <Form onSubmit={handleLogin}>
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    Error: Your API key has been <b>{error}</b>!
                </Alert>
            )}
            <Form.Group className="mb-3" controlId="apiKeyInput">
                <Form.Control
                    type="password"
                    placeholder="API key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                />
            </Form.Group>
            <Button variant="primary" className="me-2" type="submit">
                Log in
            </Button>
        </Form>
    );
}

export default ApiKeyLogin;