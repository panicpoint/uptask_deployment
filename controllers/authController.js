const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios'
}); 

exports.usuarioAutenticado = (req, res, next) => {
    //si esta autenticado pasar
    if(req.isAuthenticated()) {
        return next();
    }
    //si no esta autenticado redirigir
    return res.redirect('/iniciar-sesion');
}
//funcion para cerrar sesion
exports.cerrarSesion = ( req, res ) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); //Se cierra la sesion y nos lleva al login
    });
}

//Generar token si el usuario es valido
exports.enviarToken =  async (req, res) => {
    //verificar que el usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where: { email }});

    //Si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/reestablecer');
        }

        //Usuario existe
        usuario.token = crypto.randomBytes(20).toString('hex');
        usuario.expiracion = Date.now() + 3600000;

        //Guardarlos en la BD
        await usuario.save();

        //Crear url de reset
        const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
        
        //Enviar el correo con el token
        await enviarEmail.enviar({
            usuario,
            subject: 'Password Reset',
            resetUrl,
            archivo: 'reestablecer-password'
        });
        //Terminar y redirigir
        req.flash('correcto', 'Se envio un mensaje a tu correo');
        res.redirect('/iniciar-sesion');
    }

//Restablecer la contraseña
exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    //si no es valido
    if(!usuario) {
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    //Formulario para generar nuevo password
    res.render('resetPassword', {
        nombrePagina: 'Restablecer Contraseña'
    })
}
exports.actualizarPassword = async (req, res) => {
    //verifica un token valido y la fecha de expiración del mismo
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    });

    //Verificar si el usuario existe
    if(!usuario) {
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    //Hasshear el nuevo password

    usuario.password = bcrypt.hashSync( req.body.password, bcrypt.genSaltSync(10) );
    usuario.token = null;
    usuario.expiracion = null;

    //guardamos el nuevo password
    await usuario.save();

    req.flash('correcto', 'Tu password se a modificado correctamente');
    res.redirect('/iniciar-sesion');
}