const puppeteer = require("puppeteer");
const { pool } = require('../../database/config');

async function generarReportePDF(datos) {
  
    console.log(datos);
    
    const { cliente_id, credito_id, cantidad, fecha } = datos;
    const query = `SELECT * FROM creditos WHERE cliente_id = $1 AND credito_id = $2 AND status = 1`;
    const values = [cliente_id, credito_id ];

    const exists = await pool.query(query, values);

    if (exists.rows.length === 0) {
        throw new Error('El cliente no existe o el crédito no está activo');  
    }

    const queryCliente = `SELECT * FROM clientes where cliente_id = $1`;
    const existsClient = await pool.query(queryCliente, [cliente_id]);

    if (existsClient.rows.length === 0) {
        throw new Error('Ha ocurrido un error al obtener el cliente');  
    }

    const cliente = existsClient.rows[0];

    const queryFunction = `SELECT * FROM get_credito_details($1)`;    
    const detalles_credito = await pool.query(queryFunction, [credito_id]);
    const datos_amortizacion = detalles_credito.rows[0]
    console.log(detalles_credito.rows[0]);

    const monto_credito = datos_amortizacion.costo_terreno - datos_amortizacion.enganche;

    // select * from simular_amortizacion_con_adelanto(2, .10, 96, 20519, 410372, 10000, '2025-07-01', 12, false, '2025-10-01', 200000)

    // p_credito_id
    // p_tasa_anual
    // p_plazo_meses
    // p_enganche
    // p_costo_total
    // p_anualidad
    // p_fecha_inicio
    // p_mes_anualidad
    // p_posponer_primera_anualidad
    // p_fecha_adelanto
    // p_monto_adelanto

    const fechaAplicaAdelanto = getPrimerDiaDelMes(fecha);

    const querySimulacion = `SELECT * FROM simular_amortizacion_con_adelanto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

    const valuesSimulacion = [
        credito_id,
        Number(datos_amortizacion.tasa_anual),
        datos_amortizacion.plazo_meses,
        Number(datos_amortizacion.enganche),
        Number(datos_amortizacion.costo_terreno),
        Number(datos_amortizacion.primer_anualidad),
        datos_amortizacion.fecha_inicio,
        12,
        datos_amortizacion.anualidad_pospuesta,
        fechaAplicaAdelanto,
        cantidad
    ];

    console.log(valuesSimulacion, "Valores para la funcion de simulacion");
    

    const amortizacion = await pool.query(querySimulacion, valuesSimulacion);
    console.log(amortizacion.rowCount);

    const datosFmt = {
        ...datos_amortizacion,
        monto_credito_fmt: formatNumero(monto_credito),
        enganche_fmt: formatNumero(datos_amortizacion.enganche),
        mensualidad_fmt: formatNumero(datos_amortizacion.mensualidad),
        primer_anualidad_fmt: formatNumero(datos_amortizacion.primer_anualidad),
        precio_metro_fmt: formatNumero(datos_amortizacion.precio_metro),
        area_fmt: formatNumero(datos_amortizacion.area),
        fecha_inicio_fmt: formatFecha(datos_amortizacion.fecha_inicio),
        fecha_primer_anual_fmt: formatFecha(datos_amortizacion.fecha_primer_anual),
        fecha_actual_fmt: formatFecha(new Date())
    };

    function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatNumero(numero) {
  return Number(numero).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

    // Convertimos el arreglo en filas de tabla
    function generarTablaPagos(pagos) {
    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead style="height: 30px">
            <tr style="background: #f2f2f2; text-align: center;">
            <th># Pago</th>
            <th>Fecha</th>
            <th>Mensual</th>
            <th>Anual</th>
            <th>Interés</th>
            <th>Capital</th>
            <th>Saldo</th>
            <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${pagos
            .map(
                (pago) => `
            <tr style="text-align: right; border-bottom: 1px solid #ddd; font-size: 10px;">
                <td style="font-size: 10px;">${pago.numero_pago}</td>
                <td style="font-size: 10px;">${formatFecha(pago.fecha_pago)}</td>
                <td style="font-size: 10px;">${formatNumero(pago.mensual)}</td>
                <td style="font-size: 10px;">${formatNumero(pago.anual)}</td>
                <td style="font-size: 10px;">${formatNumero(pago.interes)}</td>
                <td style="font-size: 10px;">${formatNumero(pago.capital)}</td>
                <td style="font-size: 10px;">${formatNumero(pago.saldo)}</td>
                <td style="font-size: 10px;">${formatNumero(pago.total_pago)}</td>
            </tr>
            `
            )
            .join('')}
        </tbody>
        </table>
    `;
    }

    const tablaPagosHTML = generarTablaPagos(amortizacion.rows);    

    const htmlContent = `
        <html>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
            <style>
                *{
                    font-family: "Rubik", sans-serif;
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body { font-family: Arial, sans-serif; padding: 20px; }
                .simulacion{
                    width: 100%;
                    // height: 100vh;
                    // position: fixed;
                    // top: 0;
                    // left: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .hoja{
                    width: 100%;
                    // height: 100%;
                    background-color: white;
                    border: 1px solid gray;
                    // padding: 40px;
                    page-break-inside: avoid;
                }

                .hoja__campestre{
                    display: flex;
                    flex-direction: column;
                }


                .empresa__datos{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    // border: 1px solid rgba( 0 ,0, 0, 0.1);
                }

                .campestre__imagen, .empresa__imagen{
                    width: 10%;
                    height: max-content;
                }

                .campestre__imagen img, .empresa__imagen img{
                    width: 100%;
                    height: auto;
                }

                .fecha span{
                    font-size: 12px;
                }

                .datos{
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .datos__cliente{
                    display: flex;
                    flex-direction: column;
                }

                .cliente__identificacion{
                    padding: 20px;
                    // border: 1px solid rgba( 0 ,0, 0, 0.1);
                }

                .identificacion__datos{
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    font-size: 12px;
                }

                .nombre{
                    font-weight: 500;    
                }

                // .borde{
                //     margin-top: 10px;
                //     width: 100%;
                //     height: 1px;
                //     background-color: rgba( 0, 0, 0, 0.07);
                // }

                .cliente__datos{
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .cliente__seccion{
                    width: 100%;
                    // border-left: 1px solid rgba( 0, 0, 0, 0.07);
                    // border-right: 1px solid rgba( 0, 0, 0, 0.07);    
                    margin-bottom: 20px;
                }

                .cliente__credito{
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                }

                .detalles__credito{
                    font-size: 14px;
                    font-weight: 500;
                }

                .detalles__info{
                    font-size: 12px;
                    color: gray;
                }

                .credito{
                    width: 100%;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                }

                .credito__parte{
                    width: 25%;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .campo__dato{
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    justify-content: space-between;
                }

                .dato__indicador{
                    font-size: 12px;
                    color: rgba(0, 0, 0, .5);
                }

                .dato__valor{
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(0, 0, 0, .8);
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    page-break-inside: auto;
                }

                thead {
                    display: table-header-group; /* Repite encabezado */
                }

                tfoot {
                    display: table-footer-group;
                }

                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }

                th, td {
                    border: 1px solid #ddd;
                    padding: 4px;
                    text-align: center;
                }

                td{
                    font-size: 13px;
                }

                /* Para que se repita el encabezado */
                thead tr {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }

                /* Opcional: margen de página */
                @page {
                    size: A4;
                    margin: 20px;
                }                

                @media print {
                    .hoja {
                        page-break-after: always; /* Cada hoja se corta cuando termina */
                    }
                }

                .page-break {
                    page-break-before: always;
                }
            </style>
        </head>
        <body>
    <div class="simulacion">
            <div class="hoja">
                <div class="hoja__campestre">
                    <div class="empresa__datos">
                        <div class="campestre__imagen">
                            <img src="https://res.cloudinary.com/firstproject/image/upload/v1750715813/whsmfzhsgdhfwxbbtwsn.png" alt="">
                        </div>

                        <div class="fecha">
                            <span>Fecha creación: ${ datosFmt.fecha_actual_fmt }</span>
                        </div>
                    </div>

                    <div class="datos">
                        <div class="datos__cliente">
                            <div class="cliente__identificacion">
                                <div class="identificacion__datos">
                                    <span class="nombre">${cliente.nombre}</span>
                                    <span>${ cliente.direccion_calle }, ${ cliente.direccion_colonia }, ${ cliente.direccion_municipio }</span>
                                    <span>${ cliente.email }</span>
                                    <span>+52 ${ cliente.telefono }</span>
                                </div>                     
                            </div>

                            <div class="cliente__datos">

                                <div class="cliente__seccion">

                                    <div class="cliente__credito">
                                        <span class="detalles__credito">Detalles del crédito</span>
                                        <!-- <span class="detalles__info">Detalles de pagos inciales y medidas</span> -->
                                    </div>

                                    <div class="credito">

                                        <div class="credito__parte">
                                            <div class="campo__dato">
                                                <span class="dato__indicador">Crédito</span>
                                                <span class="dato__valor">$${ datosFmt.monto_credito_fmt }</span>
                                            </div>
        
                                            <div class="campo__dato">
                                                <span class="dato__indicador">Fecha inicio</span>
                                                <span class="dato__valor">${ datosFmt.fecha_inicio_fmt }</span>
                                            </div>
        
                                            <div class="campo__dato">
                                                <span class="dato__indicador">Mensualidad</span>
                                                <span class="dato__valor">$${ datosFmt.mensualidad_fmt }</span>
                                            </div>
                                                                                                                        
                                        </div>                                                                        

                                        <div class="credito__parte">

                                            <div class="campo__dato">
                                                <span class="dato__indicador">Enganche</span>
                                                <span class="dato__valor">$${ datosFmt.enganche_fmt }</span>
                                            </div>

                                            <div class="campo__dato">
                                                <span class="dato__indicador">Monto anualidad</span>
                                                <span class="dato__valor">$${ datosFmt.primer_anualidad_fmt }</span>
                                            </div>

                                            <div class="campo__dato">
                                                <span class="dato__indicador">Fecha anualidad</span>
                                                <span class="dato__valor">${ datosFmt.fecha_primer_anual_fmt }</span>
                                            </div>  
                                        </div>
                                        
                                        <div class="credito__parte">
                                            <div class="campo__dato">
                                                <span class="dato__indicador">Precio m²</span>
                                                <span class="dato__valor">$${ datosFmt.precio_metro_fmt }</span>
                                            </div>
                                            
                                            <div class="campo__dato">
                                                <span class="dato__indicador">Área en m²</span>
                                                <span class="dato__valor">${ datosFmt.area_fmt }</span>
                                            </div>

                                            <div class="campo__dato">
                                                <span class="dato__indicador">Plazo</span>
                                                <span class="dato__valor">${ amortizacion.rowCount } meses</span>
                                            </div>
                                            
                                        </div>

                                        <div class="credito__parte">
                                            <div class="campo__dato">
                                                <span class="dato__indicador">Tasa anual</span>
                                                <span class="dato__valor">${ datos_amortizacion.tasa_anual * 100 }%</span>
                                            </div>

                                            <div class="campo__dato">
                                                <span class="dato__indicador">Lote</span>
                                                <span class="dato__valor">${ datos_amortizacion.lote }</span>
                                            </div>

                                            <div class="campo__dato">
                                                <span class="dato__indicador">Manzana</span>
                                                <span class="dato__valor">${ datos_amortizacion.manzana }</span>
                                            </div>                                                                                  
                                        </div>
                                        
                                    </div>
                                    
                                </div>
            
                            </div>

                        </div>
                    </div>

                    <div class="borde"></div>

                    ${tablaPagosHTML}

                    <div class="page-break"></div>
                </div>
            </div>
        </div>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true
    });

    await browser.close();
    return pdfBuffer;
}

function getPrimerDiaDelMes(fechaString) {
  // 1. Validar el formato de la fecha.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    throw new Error('El formato de la fecha debe ser AAAA-MM-DD.');
  }
  
  // 2. Crear un objeto Date a partir de la cadena de texto.
  // Usamos 'T00:00:00' para evitar problemas de zona horaria.
  const fecha = new Date(`${fechaString}T00:00:00`);

  // 3. Establecer el día del mes en 1 para obtener el primer día.
  fecha.setDate(1);

  // 4. Formatear la nueva fecha a AAAA-MM-DD.
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${año}-${mes}-${dia}`;
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatNumero(numero) {
  return Number(numero).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

module.exports = { generarReportePDF };