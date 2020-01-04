const path = require('path');
const fs = require('fs');

const readFilesContents = (fileRelPaths) => {
  let fileContents = [];
  for (const fileRelPath of fileRelPaths) {
    // reading file
    const filePath = path.join(__dirname, fileRelPath);
    const code = fs.readFileSync(filePath, 'utf-8');

    fileContents.push({file:filePath, content:code});
  }
  return fileContents;
};

module.exports = {readFilesContents};
