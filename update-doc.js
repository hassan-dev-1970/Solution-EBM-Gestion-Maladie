const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const txtPath = path.join(__dirname, 'Documentation_Projet.txt');
const mdPath = path.join(__dirname, 'README.md');
const pdfPath = path.join(__dirname, 'Documentation_Projet.pdf');

const update = {
  date: new Date().toLocaleString(),
  fonctionnalite: 'Ajout du système de confirmation stylisé pour la suppression des utilisateurs.',
  fichiersModifies: [
    'src/components/ListeUtilisateurs.jsx',
    'src/components/ConfirmationSuppModal.jsx'
  ],
  packages: ['pdfkit'],
};

// Bloc à insérer dans les fichiers texte / markdown
const block = `
=== Mise à jour le ${update.date} ===
Fonctionnalité : ${update.fonctionnalite}
Fichiers modifiés : 
${update.fichiersModifies.map(f => ` - ${f}`).join('\n')}
${update.packages.length ? `Packages installés :\n${update.packages.map(p => ` - ${p}`).join('\n')}` : ''}
====================================
`;

function appendToFile(filePath, content) {
  fs.appendFileSync(filePath, content + '\n', 'utf8');
  console.log(`✅ Mis à jour : ${path.basename(filePath)}`);
}

appendToFile(txtPath, block);
appendToFile(mdPath, block);

// PDF stylisé
function generateStyledPDF(sourcePath, outputPath) {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Styles
  doc.font('Times-Roman').fontSize(14);
  doc.fillColor('#333');

  const lines = fs.readFileSync(sourcePath, 'utf8').split('\n');

  lines.forEach((line) => {
    if (line.startsWith('=== Mise à jour')) {
      doc.moveDown();
      doc.fontSize(16).fillColor('#0077cc').font('Helvetica-Bold').text(line);
      doc.moveDown(0.3);
    } else if (line.startsWith('Fonctionnalité')) {
      doc.fontSize(13).fillColor('#222').font('Helvetica-Bold').text(line);
    } else if (line.startsWith(' - ')) {
      doc.fontSize(12).fillColor('#000').font('Times-Roman').text(line);
    } else if (line.startsWith('Packages installés')) {
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text(line);
    } else if (line.startsWith('===')) {
      doc.moveDown(0.5);
      doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#ccc');
      doc.moveDown();
    } else {
      doc.fontSize(12).fillColor('#000').font('Times-Roman').text(line);
    }
  });

  doc.end();
  console.log(`📄 PDF stylisé généré : ${path.basename(outputPath)}`);
}

generateStyledPDF(txtPath, pdfPath);
