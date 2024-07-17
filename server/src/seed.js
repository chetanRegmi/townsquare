import { faker } from '@faker-js/faker';
import sequelize from './config/database.js';
import Post from './models/Post.js';
import dotenv from 'dotenv';

dotenv.config();

const createMockData = async () => {
  try {
    await sequelize.sync({ force: true, alter: true }); // Recreate database and alter tables

    for (let i = 0; i < 300; i++) {
      await Post.create({
        title: faker.lorem.sentence(),
        order: i + 1,
      });
    }

    console.log('Mock data created successfully');
  } catch (error) {
    console.error('Error in createMockData:', error);
    throw error;  // Re-throw the error to be caught in the main catch block
  }
};

createMockData()
  .then(() => {
    console.log('Seeding completed successfully');
    return sequelize.close();
  })
  .then(() => {
    console.log('Database connection closed');
  })
  .catch(error => {
    console.error('Error in main execution:', error);
    return sequelize.close();
  })
  .then(() => {
    console.log('Database connection closed after error');
    process.exit(1);
  });