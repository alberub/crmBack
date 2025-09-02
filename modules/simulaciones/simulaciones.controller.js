const { generarReportePDF } = require("./simulaciones.service");

async function getReportePDF(req, res) {
  try {

    const { cliente_id, credito_id, cantidad, fecha } = req.body;
    const datos = {
      cliente_id,
      credito_id,
      cantidad,
      fecha
    };

    const pdfBuffer = await generarReportePDF(datos);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generando PDF");
  }
}

module.exports = { getReportePDF };
