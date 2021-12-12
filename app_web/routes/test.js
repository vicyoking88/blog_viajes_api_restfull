const express =require('express')
const router=express.Router()
const mysql=require('mysql')

/**POOL DE CONEXIONES A LA BASE DE DATOS */
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_viajes'
})

/**middleware por aki se monitorea el acceso a la ruta admin */
router.use('/admin/', (peticion, respuesta, siguiente) => {
    if (!peticion.session.usuario) {
      peticion.flash('mensaje', 'Debe iniciar sesión')
      respuesta.redirect("/inicio")
    }
    else {
      siguiente()
    }
  })


module.exports=router