   const sequelize = require('./config/database');
   const logger = require('./utils/logger');

   async function testConnection() {
     try {
       await sequelize.authenticate();
       console.log('Connection has been established successfully.');
     } catch (error) {
       console.error('Unable to connect to the database:', error);
     } finally {
       await sequelize.close();
     }
   }

   testConnection();
