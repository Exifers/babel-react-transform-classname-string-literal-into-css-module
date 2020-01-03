const path = require('path');
const fs = require('fs');

const readFiles = (fileRelPaths) => {
  let fileContents = [];
  for (const fileRelPath of fileRelPaths) {
    // reading file
    const filePath = path.join(__dirname, fileRelPath);
    const code = fs.readFileSync(filePath, 'utf-8');

    fileContents.push(code);
  }
  return fileContents;
};

module.exports = {readFiles};
