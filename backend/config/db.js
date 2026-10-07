const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("MySQL configuration:");
console.log("Host:", process.env.DB_HOST);
console.log("Port:", Number(process.env.DB_PORT));
console.log("User:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);

db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection test failed:", err);
    } else {
        console.log("MySQL connection successful on port 3307");
        connection.release();
    }
});

module.exports = db;