const { Pool } = require("pg");

const pool = new Pool({
    user: "worawut",
    password: "passwordsecret",
    database: "dailyhub-db",
    host: "database-svc",
    port: 5432,
});

// ทดสอบการเชื่อมต่อ
pool.connect((err, client, release) => {
    if (err) {
        console.error("Error connecting to the database", err.stack);
    } else {
        console.log("Connected to the database");
    }
});

module.exports = pool;
