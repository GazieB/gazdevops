const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true   // 👈 THIS FIXES IT
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to AWS RDS (SQL Server)");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};
