import fs from 'fs';

const totalCodigos = 1000;
// Incluimos id (UUID falso pero válido) y code
let csvContent = 'id,code\n';

for (let i = 1; i <= totalCodigos; i++) {
  // Generamos un UUID válido para Supabase
  const hexNum = i.toString(16).padStart(12, '0');
  const uuidValido = `12345678-1234-4000-8000-${hexNum}`;
  
  const numeroFormateado = String(i).padStart(4, '0');
  const codigoUnico = `navidad-${numeroFormateado}`;
  
  csvContent += `${uuidValido},${codigoUnico}\n`;
}

fs.writeFileSync('codigos_navidad_1000.csv', csvContent, 'utf8');
console.log('¡CSV con ID y Code generado con éxito!');