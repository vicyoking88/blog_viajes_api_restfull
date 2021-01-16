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

/**api me devuelve todas las publicaciones y nos busca la publicacion que contena las palabras del query string */
router.get('/api/v1/publicaciones', (request, response) => {
    pool.getConnection((error, connection) => {
        const search = (request.query.busqueda) ? request.query.busqueda : "";
        if (search == "") {
            query = `SELECT*FROM publicaciones`
        } else {
            query = `SELECT*FROM publicaciones WHERE 
            titulo LIKE '%${search}%' or
            contenido LIKE '%${search}%' or
            resumen LIKE '%${search}%'`
        }

        connection.query(query, (error, filas, campos) => {
            response.json({ data: filas })
        })

        connection.release()
    })
})


module.exports = router