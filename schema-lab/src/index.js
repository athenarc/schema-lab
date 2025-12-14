import React, { useContext } from 'react';
import './index.scss';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppRouter from "./routes.jsx";
import AuthProvider, { UserDetailsContext } from './utils/components/auth/AuthProvider.jsx';
import ClientPreferencesProvider from './client/ClientPreferencesProvider.jsx';
import FullPageSpinner from './utils/FullPageSpinner';

const App = () => {
  const { loading } = useContext(UserDetailsContext);

  if (loading) {
    return <FullPageSpinner />;
  }

  return <AppRouter />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClientPreferencesProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClientPreferencesProvider>
  </React.StrictMode>
);

reportWebVitals();