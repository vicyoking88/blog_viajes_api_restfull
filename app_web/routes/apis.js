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

/**api que me devuelve todos los autores */
router.get('/api/v1/autores', (request, response) => {
    pool.getConnection((error, connection) => {
        const query = `select*from autores`
        connection.query(query, (error, filas, campos) => {
            response.json({ data: filas })
        })
        connection.release()
    })
})


/**api que me devuelve un autor y sus publicaciones */
router.get('/api/v1/autores/:id', (request, response) => {
    pool.getConnection((error, connection) => {

        const query = `select*from autores inner join publicaciones on autores.id=publicaciones.autor_id where autores.id=${connection.escape(request.params.id)}`

        connection.query(query, (error, filas, campos) => {
            if (filas.length > 0) {
                response.json({ data: filas })
            } else {
                response.status(404)
                response.send({ errors: ["the author does not exist"] })

            }
        })
        connection.release()
    })
})


/**api para enviar informacion a la db y crear un autor validando que no este repetido correo ni pseudonimo */
router.post('/api/v1/autores', (request, response) => {
    pool.getConnection((error, connection) => {

        const query_con_email = `SELECT * FROM autores WHERE email = ${connection.escape(request.body.email)}`

        connection.query(query_con_email, (error, filas, campos) => {

            if (filas.length > 0) {
                response.status(404)
                response.send({ errors: ["duplicate mail"] })

            } else {

                const query_pseudonimo = `SELECT * FROM autores WHERE pseudonimo = ${connection.escape(request.body.pseudonimo)}`

                connection.query(query_pseudonimo, (error, filas, campos) => {

                    if (filas.length > 0) {
                        response.status(404)
                        response.send({ errors: ["Pseudonimo duplicado"] })

                    } else {

                        const queryInsert = `insert into autores (email, contrasena, pseudonimo) values (${connection.escape(request.body.email)}, ${connection.escape(request.body.contrasena)}, ${connection.escape(request.body.pseudonimo)})`

                        connection.query(queryInsert, (error, filas, campos) => {
                            const nuevoId = filas.insertId
                            const queryConsulta = `select*from autores where id=${connection.escape(nuevoId)}`
                            connection.query(queryConsulta, (error, filas, campos) => {
                                response.status(201)
                                response.json({ data: filas[0] })
                            })
                        })

                    }
                })

            }

        })


        connection.release()
    })
})


/**api para enviar query string para nueva publicacion de la base de datos validando que sea un usuario registrado*/
router.post('/api/v1/publicaciones', (request, response) => {
    pool.getConnection((error, connection) => {

        const consulEmail = `SELECT*FROM autores WHERE email=${connection.escape(request.query.email)} AND contrasena=${connection.escape(request.query.contrasena)}`

        connection.query(consulEmail, (error, filas, campos) => {
            let data = filas[0]

            if (!filas.length > 0) {
                response.status(404)
                response.send({ errors: ["email o contraseña incorrectos"] })

            } else {

                const insertPubli = `insert into publicaciones (titulo, resumen, contenido, autor_id) values (${connection.escape(request.body.titulo)}, ${connection.escape(request.body.resumen)}, ${connection.escape(request.body.contenido)}, ${data.id})`

                connection.query(insertPubli, (error, filas, campos) => {
                    const nuevoId = filas.insertId
                    const queryConsulta = `select*from publicaciones where id=${connection.escape(nuevoId)}`

                    connection.query(queryConsulta, (error, filas, campos) => {
                        response.status(201)
                        response.json({ data: filas[0] })
                    })
                })



            }
        })

        connection.release()
    })
})


/**api para eliminar una publicacion validando credencial y que sea el dueño */
router.delete('/api/v1/publicaciones/:id', (request, response) => {
    pool.getConnection((erro, connection) => {

        const consulEmail = `SELECT*FROM autores WHERE email=${connection.escape(request.query.email)}`

        connection.query(consulEmail, (error, filas, campos) => {

            let data = filas[0]

            if (!filas.length > 0) {
                response.status(404)
                response.send({ errors: ["the author does not exist"] })

            } else {
                const consulcontra = `select*from autores where contrasena= ${connection.escape(request.query.contrasena)}`

                connection.query(consulcontra, (error, filas, campos) => {

                    if (!filas.length > 0) {
                        response.status(404)
                        response.send({ errors: ["contraseña invalida"] })

                    } else {
                        const publicPertene = `SELECT*FROM publicaciones WHERE autor_id=${data.id} AND id=${connection.escape(request.params.id)}`

                        connection.query(publicPertene, (error, filas, camkpos) => {
                            if (!filas.length > 0) {
                                response.status(404)
                                response.send({ errors: ["Esta publicacion no pertenece al usuario identificado"] })
                            } else {
                                const publicDelete = `DELETE FROM publicaciones WHERE id=${connection.escape(request.params.id)}`

                                connection.query(publicDelete, (error, filas, campos) => {
                                    response.status(204)
                                    response.json()

                                })

                            }
                        })


                    }

                })
            }
        })


        connection.release()
    })

})

module.exports = router