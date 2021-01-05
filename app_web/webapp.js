const express = require('express');
const aplication = express();
const bodyparser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const flash = require('express-flash');
const { request, response } = require('express');


aplication.use(bodyparser.json());
aplication.use(bodyparser.urlencoded({ extended: true }));
aplication.set("view engine", "ejs");
aplication.use(session({ 
  secret: 'token-muy-secreto', 
  resave: true, 
  saveUninitialized: true }));
aplication.use(flash());
aplication.use(express.static('public'))

/**creamos direccion a rutas */
const rut_test = require ('./routes/test')
const rut_publi = require ('./routes/cont_publi')
const rut_priva = require('./routes/cont_priva');

aplication.use(rut_test)
aplication.use(rut_publi)
aplication.use(rut_priva)


/**levantar SERVIDOR POR PUERTO 80800 */
aplication.listen(8080, function () {
    console.log("CORRIENDO SERVIDOR")
})