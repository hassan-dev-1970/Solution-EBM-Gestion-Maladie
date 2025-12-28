const fs = require('fs');
const PDFDocument = require('pdfkit');

// 🔄 Lire le fichier source complet
const content = fs.readFileSync('Documentation_Projet_Complet.txt', 'utf-8');
const lines = content.split('\n');

// 📄 Préparer le PDF et le TXT
const doc = new PDFDocument({ margin: 50 });
const pdfOutput = fs.createWriteStream('Documentation_Projet_Local.pdf');
const txtOutput = fs.createWriteStream('Documentation_Projet_Local.txt');
doc.pipe(pdfOutput);

// ✍️ Fonction pour écrire dans les deux fichiers
function write(line, options = {}) {
  doc.text(line, options);
  txtOutput.write(line + '\n');
}

// 🧾 En-tête
const date = new Date().toLocaleString();
doc.fontSize(16).fillColor('#003366').text('Documentation du Projet React / Express / MySQL', { align: 'center' });
txtOutput.write('Documentation du Projet React / Express / MySQL\n');
doc.moveDown();
doc.fontSize(10).fillColor('black').text(`Généré le : ${date}`, { align: 'center' });
txtOutput.write(`Généré le : ${date}\n\n`);
doc.moveDown(2);

// 📚 Table des matières (affichée, non cliquable)
const toc = [
  'Structure du projet',
  'Dépendances installées',
  'Authentification',
  'Fonctionnalités implémentées',
  'API REST (Express)',
  'Historique des modifications'
];

doc.font('Helvetica-Bold').fontSize(13).fillColor('#000').text('Table des matières', { underline: true });
txtOutput.write('Table des matières\n');
doc.moveDown(0.5);
toc.forEach((title, index) => {
  const line = `${index + 1}. ${title}`;
  doc.fontSize(11).text(line);
  txtOutput.write(line + '\n');
});
doc.addPage();
txtOutput.write('\n\n');

// 🧾 Affichage du contenu avec détection de l'historique
doc.font('Helvetica').fontSize(11).fillColor('black');

let inHistorique = false;
lines.forEach((line) => {
  const trimmed = line.trim();

  // 🔷 Détection du début de l’historique
  if (trimmed.startsWith('=== Mise à jour le') && !inHistorique) {
    inHistorique = true;
    doc.addPage();
    doc.set_font('Helvetica-Bold').fontSize(13).fillColor('#0077cc');
    write("6. Historique des modifications");
    doc.moveDown();
    doc.set_font('Helvetica').fontSize(11).fillColor('black');
  }

  // 🔸 Séparateurs
  if (trimmed === '====================================') {
    doc.moveDown(0.3);
    doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);
    txtOutput.write('\n' + '-'.repeat(80) + '\n\n');
  } else if (trimmed) {
    write(trimmed);
  } else {
    doc.moveDown(0.5);
    txtOutput.write('\n');
  }
});

// 📄 Pagination automatique
doc.on('pageAdded', () => {
  doc.fontSize(8).fillColor('gray');
  doc.text(`Page ${doc.page.number}`, 275, 820, { align: 'center' });
  doc.set_font('Helvetica').fontSize(11).fillColor('black');
});

// 🔚 Finalisation
doc.end();
txtOutput.end();
console.log('✅ PDF et TXT générés avec succès à partir de Documentation_Projet_Complet.txt');
