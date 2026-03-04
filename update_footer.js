
const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync('index.html', 'utf8');
const footerTag = '<footer class="py-16 md:py-24 bg-surface border-t border-white/5">';
const footerStart = indexContent.indexOf(footerTag);
const bodyEnd = indexContent.lastIndexOf('</body>');

if (footerStart === -1 || bodyEnd === -1) {
    console.error('Footer not found in index.html');
    process.exit(1);
}

const footerBlock = indexContent.substring(footerStart, bodyEnd).trim();
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html');

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the specific text
    // Searching for various versions of it
    const textToRemove = [
        /\* Lanzamiento total Q3 2026\. Acceso beta disponible para inversores\./g,
        /<p class="mt-8 text-xs text-slate-600 uppercase tracking-widest font-bold font-editorial italic">\s*\* Lanzamiento total Q3 2026\. Acceso beta disponible para inversores\.\s*<\/p>/g
    ];

    textToRemove.forEach(re => {
        content = content.replace(re, '');
    });

    // Replace everything from the first <footer to the end of the file
    // We want to keep everything up to the first footer, then put the new footer block, then body and html closing tags
    const firstFooterIndex = content.indexOf('<footer');
    if (firstFooterIndex !== -1) {
        const headPart = content.substring(0, firstFooterIndex);
        const newContent = headPart + "\n    " + footerBlock + "\n\n</body>\n</html>";
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    } else {
        console.warn(`No footer found in ${file}`);
    }
});
