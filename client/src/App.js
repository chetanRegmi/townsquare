import React from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import PostList from './components/PostList';

// Create a MUI theme instance
const theme = createTheme();

function App() {
  return (
    // Provide the MUI theme to the entire application
    <ThemeProvider theme={theme}>
      {/* Apply baseline CSS for consistent styling */}
      <CssBaseline />
      {/* Container to center and constrain content width */}
      <Container maxWidth="md">
        {/* Typography component for heading */}
        <Typography variant="h2" component="h1" gutterBottom>
          Posts
        </Typography>
        {/* Render the PostList component */}
        <PostList />
      </Container>
    </ThemeProvider>
  );
}

export default App; // Export the App component as the default export
