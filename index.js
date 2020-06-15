const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
//Importar las variables.env
require('dotenv').config({path: 'variables.env'});

// Importar helpers con algunas funciones
const helpers = require('./helpers');

//Crear la conexion a la BD
const db = require('./config/db');

//Importar el modelos de tablas
require('./models/Usuarios');
require('./models/Proyectos');
require('./models/Tareas');

//Sequelize crea toda la estructura de la tabla
db.sync()
    .then(() => console.log('Conectado a la Servidor'))
    .catch(error => console.log(error));

//Crear una app de express
const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

//Habilitar Pug
app.set('view engine', 'pug');

//Habilitar bodyParser para leer datos del formulario
app.use(bodyParser.urlencoded({extended: true}));


//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

//Agregar flash messages
app.use(flash());

//uso global de cookies
app.use(cookieParser());

//sesiones con express-session nos permite navegar por distintas paginas manteniendo la session abierta
app.use(session({
    secret: 'supersecreto', //Firma de sessiones cambiar por algo tipo hash
    resave: false,
    saveUninitialized: false
}));

//Iniciar passportjs
app.use(passport.initialize());
app.use(passport.session());

//Pasar vardump a la aplicación
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});

app.use('/', routes() );

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor esta funcionando');
})