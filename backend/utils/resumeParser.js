const fs = require('fs');
const path = require('path');

async function parseResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    throw new Error(`Failed to parse ${ext} file: ${err.message}`);
  }
}

module.exports = { parseResume };
