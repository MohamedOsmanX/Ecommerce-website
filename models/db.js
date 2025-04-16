const { Pool } = require('pg');
require('dotenv').config();

dbpass = process.env.DB_PASS;

const pool = new Pool({
    user: 'ecom',
    host: 'localhost',
    database: 'ecommerce',
    password: dbpass,
    port: 5432,
});

pool.connect((err, client, release) => {
    if(err) {
        return console.error('Error connecting to PostgreSQL:', err.stack);
    }
    console.log("connected to the database");
    release();
});

module.exports = pool;