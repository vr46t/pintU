const express = require('express');
const mysql = require('mysql');

module.exports = { getConnection : function (){
    return mysql.createConnection({
        host : 'localhost',
        user: 'root',
        password: 'password',
        database: 'thebloodbank_v2'
    })
}


}