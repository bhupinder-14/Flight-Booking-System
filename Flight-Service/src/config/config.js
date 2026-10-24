const {
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT,
} = require("./server-config");
module.exports = {
  development: {
    username: DB_USERNAME || "root",
    password: DB_PASSWORD || "root",
    database: DB_NAME || "flights",
    host: DB_HOST || "mysql",
    dialect: DB_DIALECT || "mysql",
  },
  test: {
    username: DB_USERNAME || "root",
    password: DB_PASSWORD || "root",
    database: process.env.DB_NAME_TEST || "flights",
    host: DB_HOST || "mysql",
    dialect: DB_DIALECT || "mysql",
  },
  production: {
    username: DB_USERNAME || "root",
    password: DB_PASSWORD || "root",
    database: process.env.DB_NAME_PROD || "flights",
    host: DB_HOST || "mysql",
    dialect: DB_DIALECT || "mysql",
  },
};
