import { faker } from '@faker-js/faker';
import sequelize from './config/database.js';
import Post from './models/Post.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Function to create mock data
const createMockData = async () => {
  try {
    // Recreate database and alter tables based on models
    await sequelize.sync({ force: true, alter: true });

    // Generate 300 mock posts
    for (let i = 0; i < 300; i++) {
      await Post.create({
        title: faker.lorem.sentence(), // Generate a random sentence for the title
        order: i + 1, // Assign an incremental order value
      });
    }

    console.log('Mock data created successfully'); // Log success message
  } catch (error) {
    console.error('Error in createMockData:', error); // Log error message
    throw error;  // Re-throw the error to be caught in the main catch block
  }
};

// Execute the createMockData function and handle the outcome
createMockData()
  .then(() => {
    console.log('Seeding completed successfully'); // Log success message when seeding is complete
    return sequelize.close(); // Close the database connection
  })
  .then(() => {
    console.log('Database connection closed'); // Log message when database connection is closed
  })
  .catch(error => {
    console.error('Error in main execution:', error); // Log error message for main execution
    return sequelize.close(); // Close the database connection in case of an error
  })
  .then(() => {
    console.log('Database connection closed after error'); // Log message when database connection is closed after an error
    process.exit(1); // Exit the process with an error code
  });
