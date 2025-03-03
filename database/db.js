const { Pool } = require('pg');

// Create a pool instance
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'EVS',
    password: 'admin',
    port: 5432,
});

// Handle errors during pool creation
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
