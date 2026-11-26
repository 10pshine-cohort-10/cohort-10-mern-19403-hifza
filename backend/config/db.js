const mysql2 = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();


let pool = mysql2.createPool({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT,

    ssl: {rejectUnauthorized: false}
});

const promisePool = pool.promise();

pool.getConnection((err, connection)=>{
    if(err){
        console.log("DATABASE connection failed: ", err.message);
        return;
    }
    else{
        console.log("DATABASE connected successfully!");
    }

    connection.release();
});

module.exports = promisePool;