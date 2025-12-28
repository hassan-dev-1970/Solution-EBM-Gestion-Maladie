const fs = require('fs');
const PDFDocument = require('pdfkit');

// Lire le fichier texte dans le dossier courant
const content = fs.readFileSync('Documentation_Projet.txt', 'utf-8');
const lines = content.split('\n');

// Créer le PDF
const doc = new PDFDocument({ margin: 50 });
const output = fs.createWriteStream('Documentation_Projet_Local.pdf');
doc.pipe(output);

// En-tête
const date = new Date().toLocaleString();
doc.fontSize(16).fillColor('#003366').text('Documentation du Projet React / Express / MySQL', { align: 'center' });
doc.moveDown();
doc.fontSize(10).fillColor('black').text(`Généré le : ${date}`, { align: 'center' });
doc.moveDown(2);

// Table des matières (affichée)
const sections = [
  'Structure du projet',
  'Dépendances installées',
  'Authentification',
  'Fonctionnalités implémentées',
  'API REST (Express)',
  'Historique des modifications'
];

doc.fontSize(13).fillColor('#000').text('Table des matières', { underline: true });
doc.moveDown(0.5);
sections.forEach((title, i) => {
  doc.fontSize(11).text(`${i + 1}. ${title}`);
});
doc.addPage();

// Affichage du contenu
doc.font('Helvetica').fontSize(11).fillColor('black');
let sectionIndex = 0;
lines.forEach((line) => {
  const trimmed = line.trim();

  const match = sections.find(s => trimmed.toLowerCase().includes(s.toLowerCase()));
  if (match) {
    sectionIndex = sections.indexOf(match) + 1;
    doc.addPage();
    doc.fontSize(13).fillColor('#003366').font('Helvetica-Bold').text(`${sectionIndex}. ${match}`);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor('black');
  } else if (trimmed === '====================================') {
    doc.moveDown(0.3);
    doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);
  } else if (trimmed.startsWith('=== Mise à jour le')) {
    doc.addPage();
    doc.fontSize(13).fillColor('#0077cc').font('Helvetica-Bold').text(`6. Historique des modifications`);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor('black');
    doc.text(trimmed);
  } else {
    doc.text(trimmed);
  }
});

// Pied de page avec pagination
doc.on('pageAdded', () => {
  doc.fontSize(8).fillColor('gray');
  doc.text(`Page ${doc.page.number}`, 275, 820, { align: 'center' });
  doc.font('Helvetica').fontSize(11).fillColor('black');
});

doc.end();
console.log('✅ Documentation_Projet_Local.pdf généré avec succès');
