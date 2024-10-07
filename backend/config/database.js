const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('POSTGRES_URL:', process.env.POSTGRES_URL);

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL is not defined in the environment variables.');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;