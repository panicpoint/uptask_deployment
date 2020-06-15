const passport = require('passport');
const LocalStrategy= require('passport-local').Strategy;

//Referencia la modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

//Local Strategy = Login con credenciales propias (usuario y password)
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where : { 
                        email,
                        activo: 1
                    }
                });
                //El usuario existe, password incorrecto
                if(!usuario.verificarPassword(password)) {
                    return done(null, false, {
                        message : 'Password Incorrecto'
                    })
                }
                //El email y password correctos se puede autenticar
                return done(null, usuario);
            } catch (error) {
                //El usuario no existe
                return done(null, false, {
                    message : 'Esa cuenta no existe'
                })
                
            }
        }
    )
);

//Serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
});

//Desearilizar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
});

//exportar
module.exports = passport;

