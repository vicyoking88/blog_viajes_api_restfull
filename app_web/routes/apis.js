const { request, response } = require('express')
const express = require('express')
const router = express.Router()
const mysql = require('mysql')


/**POOL DE CONEXIONES A LA BASE DE DATOS */
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_viajes'
})



module.exports = router