import fs from 'fs';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

async function generarPDFsPorHoja() {
  const totalCodigos = 1000;
  const codigosPorHoja = 100; // 100 códigos por hoja tamaño carta (cuadrícula de 10x10)
  
  // Creamos una carpeta para guardar los PDFs
  if (!fs.existsSync('./pdf_hojas_navidad')) {
    fs.mkdirSync('./pdf_hojas_navidad');
  }

  console.log('🚀 Generando las hojas tamaño carta con 100 QR cada una...');

  // Dividimos los 1,000 códigos en bloques de 100 (generará 10 archivos PDF en total)
  for (let hoja = 0; hoja < totalCodigos / codigosPorHoja; hoja++) {
    const doc = new PDFDocument({ size: 'LETTER', margin: 30 });
    const rutaPdf = `./pdf_hojas_navidad/hoja_${hoja + 1}_codigos_${hoja * 100 + 1}_al_${(hoja + 1) * 100}.pdf`;
    doc.pipe(fs.createWriteStream(rutaPdf));

    // Título de la hoja
    doc.fontSize(16).text(`Villa Navideña QRomos - Hoja ${hoja + 1} (Códigos ${(hoja * 100) + 1} al ${(hoja + 1) * 100})`, { align: 'center' });
    doc.moveDown(0.5);

    // Dimensiones de la cuadrícula en la hoja carta (612 x 792 puntos)
    const inicioX = 40;
    const inicioY = 80;
    const columnas = 10;
    const anchoCasilla = 52; 
    const altoCasilla = 62;

    for (let i = 0; i < codigosPorHoja; i++) {
      const indexGlobal = (hoja * codigosPorHoja) + i + 1;
      if (indexGlobal > totalCodigos) break;

      const numeroFormateado = String(indexGlobal).padStart(4, '0');
      const codigo = `navidad-${numeroFormateado}`;
      const textoQR = `https://qromos.com/canjear?code=${codigo}`;

      // Generamos el QR como imagen temporal en buffer base64
      const qrBuffer = await QRCode.toBuffer(textoQR, { width: 150, margin: 1 });

      // Coordenadas en la cuadrícula de 10x10
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const x = inicioX + (col * anchoCasilla);
      const y = inicioY + (fila * altoCasilla);

      // Dibujamos el QR en el PDF
      doc.image(qrBuffer, x, y, { width: 45, height: 45 });
      
      // Ponemos el texto del código chiquito abajo del QR
      doc.fontSize(7).text(codigo, x, y + 46, { width: 45, align: 'center' });
    }

    doc.end();
  }

  console.log('¡Listo! Se han generado los PDFs en la carpeta "pdf_hojas_navidad" con 100 QR cada uno.');
}

generarPDFsPorHoja();