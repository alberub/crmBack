function validarComplejidadContrasenia(contrasenia) {
    const requisitos = [
        {
            regex: /.{8,}/,
            mensaje: "La contraseña debe tener al menos 8 caracteres."
        },
        {
            regex: /[A-Z]/,
            mensaje: "La contraseña debe tener al menos una letra mayúscula."
        },
        {
            regex: /[a-z]/,
            mensaje: "La contraseña debe tener al menos una letra minúscula."
        },
        {
            regex: /[0-9]/,
            mensaje: "La contraseña debe tener al menos un número."
        },
        {
            regex: /[\!\@\#\$\%\^\&\*\(\)\-\=\+\[\]\{\}\|\;\:\'\"\<\>\,\.\/\?]/,
            mensaje: "La contraseña debe tener al menos un caracter especial como !, @, #, etc."
        }
    ];

    const errores = [];

    requisitos.forEach(requisito => {
        if (!requisito.regex.test(contrasenia)) {
            errores.push(requisito.mensaje);
        }
    });

    return {
        esValida: errores.length === 0,
        errores
    };
}

module.exports = {
    validarComplejidadContrasenia
}