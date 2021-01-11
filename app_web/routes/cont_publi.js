const { request, response } = require('express')
const express = require('express')
const router = express.Router()
const mysql = require('mysql')
var path = require('path')
const nodemailer = require('nodemailer')

/**codigo que envia el correo electronico */
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'nigh4@hotmail.com',
      pass: 'V.amc880503pa'
    }
  })

/**POOL DE CONEXIONES A LA BASE DE DATOS */
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_viajes'
})

/**funcion que envia el correo */
function enviarCorreoBienvenida(email, nombre){
    const opciones = {
      from: 'nigh4@hotmail.com',
      to: email,
      subject: 'Bienvenido al blog de viajes',
      text: `Hola ${nombre}`
    }
    transporter.sendMail(opciones, (error, info) => {
    });
  }

/**ROTA A LA WEB PRINCIPAL */
router.get('/', (request, response) => {
    pool.getConnection(function (err, connection) {
        let consulta
        let modificadorConsulta = ""
        let modificadorPagina = ""
        let pagina = 0


        const busqueda = (request.query.busqueda) ? request.query.busqueda : ""
        if (busqueda != "") {
            modificadorConsulta = `
                WHERE
                titulo LIKE '%${busqueda}%' OR
                resumen LIKE '%${busqueda}%' OR
                contenido LIKE '%${busqueda}%'
                `
            modificadorPagina = ""
        }

        else {

            pagina = (request.query.pagina) ? parseInt(request.query.pagina) : 0
            if (pagina < 0) {
                pagina = 0
            }
            modificadorPagina = `
              LIMIT 5 OFFSET ${pagina * 5}
            `

        }

        consulta = `
          SELECT
          publicaciones.id id, titulo, resumen, fecha_hora, pseudonimo, votos, avatar
          FROM publicaciones
          INNER JOIN autores
          ON publicaciones.autor_id = autores.id
          ${modificadorConsulta}
          ORDER BY fecha_hora DESC
          ${modificadorPagina}
        `
        connection.query(consulta, function (error, filas, campos) {
            response.render('index', { publicaciones: filas, busqueda: busqueda, pagina: pagina })
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

                            if (request.files && request.files.avatar) {

                                const archivoAvatar = request.files.avatar
                                const id = filas.insertId
                                const nombreArchivo = `${id}${path.extname(archivoAvatar.name)}`

                                archivoAvatar.mv(`./public/avatars/${nombreArchivo}`, (error) => {

                                    const consultaAvatar =
                                        `UPDATE
                                        autores
                                        SET avatar = ${connection.escape(nombreArchivo)}
                                        WHERE id = ${connection.escape(id)}
                                        `
                                    connection.query(consultaAvatar, (error, filas, campos) => {
                                        enviarCorreoBienvenida(email, pseudonimo)
                                        request.flash('mensaje', 'Usuario registrado con avatar')
                                        response.redirect('/registro')
                                    })

                                })

                            } else {
                                enviarCorreoBienvenida(email, pseudonimo)
                                request.flash('mensaje', 'Usuario registrado')
                                response.redirect('/registro')
                            }
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

/**ruta para mostrar detalle de la publicacion al pinchar en ella */
router.get('/publicacion/:id', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
        const consulta = `
        SELECT *
        FROM publicaciones
        WHERE id = ${connection.escape(peticion.params.id)}
      `
        connection.query(consulta, (error, filas, campos) => {
            if (filas.length > 0) {
                respuesta.render('publicacion', { publicacion: filas[0] })
            }
            else {
                respuesta.redirect('/')
            }
        })
        connection.release()
    })
})

/**ruta con la que se carga el contenido del html de los aurotes y sus publicaciones */
router.get('/autores', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
      const consulta = `
        SELECT autores.id id, pseudonimo, avatar, publicaciones.id publicacion_id, titulo
        FROM autores
        INNER JOIN
        publicaciones
        ON
        autores.id = publicaciones.autor_id
        ORDER BY autores.id DESC, publicaciones.fecha_hora DESC
      `
      connection.query(consulta, (error, filas, campos) => {
        autores = []
        ultimoAutorId = undefined
        filas.forEach(registro => {
          if (registro.id != ultimoAutorId){
            ultimoAutorId = registro.id
            autores.push({
              id: registro.id,
              pseudonimo: registro.pseudonimo,
              avatar: registro.avatar,
              publicaciones: []
            })
          }
          autores[autores.length-1].publicaciones.push({
            id: registro.publicacion_id,
            titulo: registro.titulo
          })
        });
        respuesta.render('autores', { autores: autores })
      })
  
  
      connection.release()
    })
  })


  /**consulta que carga o suma a la casilla votos un voto y lo actualiza */
  router.get('/publicacion/:id/votar', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
      const consulta = `
        SELECT *
        FROM publicaciones
        WHERE id = ${connection.escape(peticion.params.id)}
      `
      connection.query(consulta, (error, filas, campos) => {
        if (filas.length > 0) {
          const consultaVoto = `
            UPDATE publicaciones
            SET
            votos = votos + 1
            WHERE id = ${connection.escape(peticion.params.id)}
          `
          connection.query(consultaVoto, (error, filas, campos) => {
            respuesta.redirect(`/publicacion/${peticion.params.id}`)
          })
        }
        else {
          peticion.flash('mensaje', 'Publicación inválida')
          respuesta.redirect('/')
        }
      })
      connection.release()
    })
  })
  
module.exports = router