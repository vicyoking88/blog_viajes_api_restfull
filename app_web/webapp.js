const express = require('express');
const aplication=express();
const bodyparser=require('body-parser');
const session=require('express-session');
const mysql=require('mysql');
const flash = require('express-flash');

aplication.use(bodyparser.json());
aplication.use(bodyparser.urlencoded({extended:true}));
aplication.set("view engine", "ejs");
aplication.use(session({secret:'token-muy-secreto', resave:true, saveUninitialized:true}));
aplication.use(flash());
aplication.use(express.static('public'))

/**POOL DE CONEXIONES A LA BASE DE DATOS */
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_viajes'
})

/**ROTA A LA WEB PRINCIPAL */
aplication.get('/', (request, response)=>{
    response.render('index.ejs')
})

/**levantar SERVIDOR POR PUERTO 80800 */
aplication.listen(8080, function(){
    console.log("CORRIENDO SERVIDOR")
})