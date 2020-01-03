const css = require("css");
const cssExtractors = require('./cssExtractors');

const computeMapFileToClassnames = (fileContents) => {
  let mapFileToClassnames = {};
  for (const fileContent of fileContents) {
    const parsed = css.parse(fileContent);
    mapFileToClassnames[fileContent] = cssExtractors.classnamesCSSASTExtractor(parsed);
  }
  return mapFileToClassnames;
};

const computeFileFromClassname = (classname, mapFilesToClassnames) => {
  const matched = Object.entries(mapFilesToClassnames).reduce((acc, cur) => {
    const file = cur[0];
    const classnames = cur[1];

    const matchedClassnames = classnames.filter(c => c === classname);

    if (matchedClassnames.length) {
      acc[file] = matchedClassnames;
    }

    return acc;
  }, {});

  if (Object.keys(matched).length === 0) {
    // no classname found
    return null;
  }
  if (Object.keys(matched).length > 1) {
    // conflict across multiple files
    return Object.keys(matched)[0];
  }
  if (Object.values(matched)[0].length > 1) {
    // conflict inside one file
    return Object.keys(matched)[0];
  }
  // no conflict
  return Object.keys(matched)[0];
};

const computeMapClassnamesToFiles = (classnames, classnamesPerFiles) => {
  const mapClassnamesToFiles = {};
  for (const classname of classnames) {
    const fileRelPath = computeFileFromClassname(
      classname,
      classnamesPerFiles
    );
    mapClassnamesToFiles[classname] = fileRelPath; // null if file not found
  }
  return mapClassnamesToFiles;
};

module.exports = {
  computeMapFileToClassnames,
  computeMapClassnamesToFiles
};
