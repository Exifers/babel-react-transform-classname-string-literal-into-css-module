const css = require("css");
const {classnamesCSSASTExtractor} = require('./cssExtractors');

const computeMapFileToClassnames = (fileContents) => {
  let mapFileToClassnames = new Map();
  for (const fileContent of fileContents) {
    const parsed = css.parse(fileContent);
    mapFileToClassnames.set(fileContent, classnamesCSSASTExtractor(parsed));
  }
  return mapFileToClassnames;
};

const computeFileFromClassname = (classname, mapFileToClassnames) => {
  const matched = new Map();

  for (const [file, classnames] of mapFileToClassnames.entries()) {
    const matchedClassnames = classnames.filter(c => c === classname);
    if (matchedClassnames.length) {
      matched.set(file, matchedClassnames);
    }
  }

  if (matched.size === 0) {
    // no classname found
    return null;
  }
  if (matched.size > 1) {
    // conflict across multiple files
    return matched.keys()[0];
  }
  if (Array.from(matched.values())[0].length > 1) {
    // conflict inside one file
    return Array.from(matched.keys())[0];
  }
  // no conflict
  return Array.from(matched.keys())[0];
};

const computeMapClassnamesToFiles = (classnames, mapFileToClassnames) => {
  const mapClassnamesToFiles = new Map();
  for (const classname of classnames) {
    const fileRelPath = computeFileFromClassname(
      classname,
      mapFileToClassnames
    );
    mapClassnamesToFiles.set(classname, fileRelPath); // null if file not found
  }
  return mapClassnamesToFiles;
};

module.exports = {
  computeMapFileToClassnames,
  computeMapClassnamesToFiles
};
