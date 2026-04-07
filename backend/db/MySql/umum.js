var mysql = require('mysql2');
var db  = mysql.createPool({
    connectionLimit : process.env.LIMIT_DB_MYSQL,
    host     : process.env.HOST_DB_MYSQL,
    user     : process.env.USER_DB_MYSQL,
    password : process.env.PASS_DB_MYSQL,
    database : 'konsel_setara',
});

db.getConnection((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Terkoneksi DATABASE KONSEL SETARA');
    }
})

module.exports = db;