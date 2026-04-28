const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const sequelize = new Sequelize(
  process.env.MYSQL_DB || "car_dealership",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD ?? "",
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }
);

module.exports = sequelize;

