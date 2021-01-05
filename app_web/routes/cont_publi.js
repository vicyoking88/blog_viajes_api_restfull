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

/**ROTA A LA WEB PRINCIPAL */
router.get('/', (request, response) => {
    pool.getConnection(function (err, connection) {
        let consulta
        let modificadorConsulta = ""
        const busqueda = (request.query.busqueda) ? request.query.busqueda : ""
        if (busqueda != "") {
            modificadorConsulta = `
                WHERE
                titulo LIKE '%${busqueda}%' OR
                resumen LIKE '%${busqueda}%' OR
                contenido LIKE '%${busqueda}%'
                `
        }
        consulta = `
          SELECT
          titulo, resumen, fecha_hora, pseudonimo, votos
          FROM publicaciones
          INNER JOIN autores
          ON publicaciones.autor_id = autores.id
          ${modificadorConsulta}
          ORDER BY fecha_hora DESC
          LIMIT 5
        `
        connection.query(consulta, function (error, filas, campos) {
            response.render('index', { publicaciones: filas, busqueda: busqueda })
        })
        connection.release()
    })
})

/**RUTA PARA REGISTRO */
router.get('/registro', (request, response) => {
    response.render('registro', { mensaje: request.flash('mensaje') })
})

/**ruta para procesar registro */
router.post('/procesar_registro', (request, response) => {
    pool.getConnection((err, connection) => {
        const email = request.body.email.toLowerCase().trim()
        const pseudonimo = request.body.pseudonimo.trim()
        const contrasena = request.body.contrasena

        /**realizamos una consulta para validar que el email no sea igual que el psedonimo */
        const consultaEmail = `
        select * from autores
        where email = ${connection.escape(email)}`

        connection.query(consultaEmail, (error, filas, campos) => {
            /**preguntamos si encontro un pseudonimo duplicado 
             * si se encuentra 1 o mas registros enviamos el mensaje de email duplicado de lo contrario ejecutamos el query para registrar el nuevo usuario
            */
            if (filas.length > 0) {
                request.flash('mensaje', 'Email duplicado')
                response.redirect('/registro')
            } else {

                const consultaPseudonimo = `
                select * from autores
                where pseudonimo = ${connection.escape(pseudonimo)}`

                connection.query(consultaPseudonimo, (error, filas, campos) => {
                    if (filas.length > 0) {
                        request.flash('mensaje', 'Pseudonimo duplicado')
                        response.redirect('/registro')
                    } else {


                        const consulta = `
                insert into autores (email, contrasena, pseudonimo)
                values (
                    ${connection.escape(email)},
                    ${connection.escape(contrasena)},
                    ${connection.escape(pseudonimo)}
                )`
                        connection.query(consulta, (error, filas, campos) => {
                            request.flash('mensaje', 'Usuario registrado')
                            response.redirect('/registro')
                        })
                    }
                })
            }

        })

        connection.release()
    })
})



/**RUTA PARA CARGAR LA WEB DE INICIO SESION */
router.get('/inicio', function (peticion, respuesta) {
    respuesta.render('inicio', { mensaje: peticion.flash('mensaje') })
})

/**RUTA PARA PROCESAR LOS DATOS DE INICIO DE SESION CORREO Y CONTRASEÑA */
router.post('/procesar_inicio', function (peticion, respuesta) {
    pool.getConnection(function (err, connection) {
        const consulta = `
        SELECT *
        FROM autores
        WHERE
        email = ${connection.escape(peticion.body.email)} AND
        contrasena = ${connection.escape(peticion.body.contrasena)}
      `
        connection.query(consulta, function (error, filas, campos) {
            if (filas.length > 0) {
                peticion.session.usuario = filas[0]
                respuesta.redirect('/admin/index')
            }
            else {
                peticion.flash('mensaje', 'Datos inválidos')
                respuesta.redirect('/inicio')
            }

        })
        connection.release()
    })
})

module.exports = router