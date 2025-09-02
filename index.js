const express = require('express');
require( 'dotenv' ).config();

const path = require('path');
const cors = require('cors');

const { probarConexion } = require('./database/config');

const app = express();
const server = require('http').createServer( app );

app.use( cors() );

app.use( express.json() );

probarConexion();

// Directorio publico

app.use(express.static('public')); 

app.use( '/api/login', require('./routes/auth') );

app.use( '/api/amortizacion', require('./modules/amortizacion/amortizacion.route') );

app.use( '/api/clientes', require('./modules/clientes/clientes.route') );

app.use('/api/creditos', require('./modules/creditos/creditos.route'));

app.use('/api/pagos', require('./modules/pagos/pagos.route'));

app.use('/api/simulacion', require('./modules/simulaciones/simulaciones.route'));

app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
});

server.listen( process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});