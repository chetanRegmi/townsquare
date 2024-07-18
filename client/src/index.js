import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import client from './apolloClient';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}


// Render the React application
ReactDOM.render(
  <React.StrictMode>
    {/* Provide the Apollo Client instance to the React application */}
    <ApolloProvider client={client}>
      {/* Render the main App component */}
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root') // Target the root DOM element to mount the React application
);
