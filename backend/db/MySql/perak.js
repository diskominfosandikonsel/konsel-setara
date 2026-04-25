var mysql = require('mysql2');
var db  = mysql.createPool({
    connectionLimit : process.env.LIMIT_DB_MYSQL,
    host     : process.env.HOST_DB_MYSQL,
    user     : process.env.USER_DB_MYSQL,
    password : process.env.PASS_DB_MYSQL,
    database : 'perak_konsel',
});

db.getConnection((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Terkoneksi DATABASE PERAK KONSEL');
    }
})

module.exports = db;