const express =require('express')
const router=express.Router()
const mysql=require('mysql')

/**POOL DE CONEXIONES A LA BASE DE DATOS */
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'us-cdbr-east-04.cleardb.com',
    user: 'b64328a795ff0e',
    password: '336371f8',
    database: 'heroku_55a18aa4559fa12'
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