const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');


exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear cuenta en UpTask'
    })
}

exports.formIniciarSesion = (req, res) => {
    const { error } = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina: 'Inicia Sesión en UpTask',
        error
    })
}

exports.crearCuenta = async (req, res) => {
    //leer datos
    const { email, password } = req.body;

    try {
        //crear el usuario
        await Usuarios.create({
            email,
            password
        });

        //Crear una URL de confirmación
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;
        //Crear el objeto de usuario
        const usuario = {
            email
        }
        //Enviar email
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta en UpTask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        });
        //Redirigir al inicio de sesión
        req.flash('correcto', 'Enviamos un correo confirma tu cuenta');
        res.redirect('/iniciar-sesion')
        
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina: 'Crear cuenta en UpTask',
            email,
            password
        })
    }
}

exports.formRestablecerPassword = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer tu contraseña'
    });
}

//Confirmar la cuenta de usuario
exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    //Si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No valido');
        res.redirect('/crear-cuenta');
    }

    //Activar
    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Cuenta Activada Correctamente');
    res.redirect('/iniciar-sesion');
} 