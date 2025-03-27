require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({
    user: process.env.PGUSER,
    password: "Moa0d9aMnw",
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        console.log('Połączono z bazą danych');
        client.release();  
    } catch (err) {
        console.error('Błąd połączenia z bazą danych', err);
        process.exit(1); 
    }
};

testConnection();

module.exports = pool;