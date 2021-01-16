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

/**api que me devuelve una publicacion de acuerdo a su id */
router.get('/api/v1/publicaciones/:id', (request, response) => {
    pool.getConnection((error, connection) => {

        const query = `select*from publicaciones where id=${connection.escape(request.params.id)}`

        connection.query(query, (error, filas, campos) => {
            if (filas.length > 0) {
                response.json({ data: filas[0] })
            } else {
                response.status(404)
                response.send({ errors: ["There is no publication"] })
            }

        })
        connection.release()
    })
})


module.exports = router