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

/**RUTA WEB DE USUARIO despues de que SE CONSULTE EN LA BASE DE DATOS SI EL USUARIO ESTA REGISTRADO CARGAMOS LA PAGINA PRIVADA A LA QUE EL USUARIO PUEDE TENER ACCESO */

/**cargamos y sonsultamos los datos de dicho usuario y los mostramos en una tabla html */
router.get('/admin/index', function (peticion, respuesta) {
    pool.getConnection(function (err, connection) {
        const consulta = `
        SELECT *
        FROM publicaciones
        WHERE
        autor_id = ${connection.escape(peticion.session.usuario.id)}
      `
        connection.query(consulta, function (error, filas, campos) {
            respuesta.render('admin/index', { usuario: peticion.session.usuario, mensaje: peticion.flash('mensaje'), publicaciones: filas })
        })
        connection.release()
    })
})

/**RUTA PARA CERRAR CESION DIRECCIONAR A LA PAGINA PRICIPAL */
router.get('/procesar_cerrar_sesion', function (peticion, respuesta) {
    peticion.session.destroy();
    respuesta.redirect("/")
});

/**ruta para cargar el formulario donde se agrega un nuevo registro del autor */
router.get('/admin/agregar', function (peticion, respuesta) {
    respuesta.render('admin/agregar', { mensaje: peticion.flash('mensaje'), usuario: peticion.session.usuario })
})

/**enviamos el  contenido del formulario con el nuevo registro agregar a la base de datos */
router.post('/admin/procesar_agregar', function (peticion, respuesta) {
    pool.getConnection(function (err, connection) {
        const date = new Date()
        const fecha = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        const consulta = `
            INSERT INTO
            publicaciones
            (titulo, resumen, contenido, autor_id, fecha_hora)
            VALUES
            (
              ${connection.escape(peticion.body.titulo)},
              ${connection.escape(peticion.body.resumen)},
              ${connection.escape(peticion.body.contenido)},
              ${connection.escape(peticion.session.usuario.id)},
              ${connection.escape(fecha)}
            )
          `
        connection.query(consulta, function (error, filas, campos) {
            peticion.flash('mensaje', 'Publicación agregada')
            respuesta.redirect("/admin/index")
        })
        connection.release()
    })
})

/**ruta con query para editar un parametro de la tabla del autor */
router.get('/admin/editar/:id', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
      const consulta = `
        SELECT * FROM publicaciones
        WHERE
        id = ${connection.escape(peticion.params.id)}
        AND
        autor_id = ${connection.escape(peticion.session.usuario.id)}
      `
      connection.query(consulta, (error, filas, campos) => {
        if (filas.length > 0){
          respuesta.render('admin/editar', {publicacion: filas[0], mensaje: peticion.flash('mensaje'), usuario: peticion.session.usuario})
        }
        else{
          peticion.flash('mensaje', 'Operación no permitida')
          respuesta.redirect("/admin/index")
        }
      })
      connection.release()
    })
  })

/**ruta para modificar la fila de la tabla de publicaciones */

  router.post('/admin/procesar_editar', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
      const consulta = `
        UPDATE publicaciones
        SET
        titulo = ${connection.escape(peticion.body.titulo)},
        resumen = ${connection.escape(peticion.body.resumen)},
        contenido = ${connection.escape(peticion.body.contenido)}
        WHERE
        id = ${connection.escape(peticion.body.id)}
        AND
        autor_id = ${connection.escape(peticion.session.usuario.id)}
      `
      connection.query(consulta, (error, filas, campos) => {
        if (filas && filas.changedRows > 0){
          peticion.flash('mensaje', 'Publicación editada')
        }
        else{
          peticion.flash('mensaje', 'Publicación no editada')
        }
        respuesta.redirect("/admin/index")
      })
      connection.release()
    })
  })

  /**ruta para ejecutar el query de eliminacion de registro */
  router.get('/admin/procesar_eliminar/:id', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
      const consulta = `
        DELETE
        FROM
        publicaciones
        WHERE
        id = ${connection.escape(peticion.params.id)}
        AND
        autor_id = ${connection.escape(peticion.session.usuario.id)}
      `
      connection.query(consulta, (error, filas, campos) => {
        if (filas && filas.affectedRows > 0){
          peticion.flash('mensaje', 'Publicación eliminada')
        }
        else{
          peticion.flash('mensaje', 'Publicación no eliminada')
        }
        respuesta.redirect("/admin/index")
      })
      connection.release()
    })
  })

module.exports = router