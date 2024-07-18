# Post List Application

## Project Overview

This is a full-stack application that displays and allows reordering of posts, demonstrating proficiency in React, GraphQL, and database management. The application shows a list of post titles with their order numbers, allows drag-and-drop reordering, and implements infinite scrolling.

## Tech Stack

- Frontend: React with functional components and hooks
- Backend: Node.js with Apollo Server for GraphQL
- Database: PostgreSQL
- ORM: Sequelize
- GraphQL Client: Apollo Client (with WebSocket support)
- UI Framework: Material-UI (MUI)
- Testing: Jest
- Additional Libraries: 
  - Faker (for generating seed data)
  - React Drag and Drop library

## Features

- Display a list of at least 300 post titles
- Drag-and-drop functionality to reorder posts
- Infinite scrolling with a "Load More" button
- Real-time updates using GraphQL subscriptions
- Persistence of post order across page reloads

## Setup Instructions

### Prerequisites

- Node.js
- PostgreSQL

### Backend Setup

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
```bash
npm install
```
4. Set up your PostgreSQL database and update the connection details in your environment variables (env.local)
5. Run the database seeder:
```bash
node src/seed.js
```
6. Start the server:
```bash
node index.js
```


Available Scripts

node src/seed.js: Populate the database with initial data (300 posts)
node index.js: Start the backend server
npm start: Run the frontend application in development mode
npm test: Run Jest unit tests
npm run build: Build the frontend application for production

Deployment
The application is hosted on Vercel. However, please note that there are limitations with Vercel regarding ApolloClient WebSocket support.


Live URL: 
backend: https://townsquare-server-2guqsf7eq-chetan-regmis-projects.vercel.app/api/graphql
frontend: https://townsquare-client-rho.vercel.app/


Notes and Assumptions

The application uses offset and limit pagination for the "Load More" functionality.
Real-time updates are implemented using GraphQL subscriptions, but may not work as expected in the Vercel deployment due to WebSocket limitations.
The drag and drop functionality is implemented using a React library and allows reordering of posts.
The database schema is designed to store posts with their titles and order.
Faker is used to generate realistic mock data for the posts.

Future Improvements

Explore alternative hosting solutions that fully support WebSocket connections for real-time features.
Implement more comprehensive error handling and user feedback.
Enhance the UI/UX design for better user interaction.
