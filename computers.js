const css = require("css");
const {classnamesCSSASTExtractor} = require('./cssExtractors');

function computeMapFileToClassnames(mapFilesToContents) {
  let mapFileToClassnames = new Map();
  for (const {file, content} of mapFilesToContents) {
    const parsed = css.parse(content);
    mapFileToClassnames.set(file, this.optionsDefaulter.get('classnamesCSSASTExtractor')(parsed));
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
  const mapClassnamesToFiles = [];
  for (const classname of classnames) {
    const fileRelPath = computeFileFromClassname(
      classname,
      mapFileToClassnames
    );
    mapClassnamesToFiles.push({classname, file: fileRelPath}); // null if file not found
  }
  return mapClassnamesToFiles;
};

function *genComputeMapFilesToIdentifiers() {
  let filesToIdentifiers = [];
  let newFiles = [];
  let index = 1;
  while (true) {
    filesToIdentifiers = [
      ...filesToIdentifiers,
      ...newFiles
        .filter(newFile => !filesToIdentifiers.find(({file}) => file === newFile))
        .map(file => ({file, identifier: 'styles' + index++}))
    ];
    newFiles = yield filesToIdentifiers;
  }
}

function computeUsedFiles(mapClassnamesToFiles) {
  return mapClassnamesToFiles
    .map(({file}) => file)
    .filter(Boolean)
    .filter((file, index, array) => array.indexOf(file) === index)
}

function computeMapClassnamesToFilesAndIdentifiers(mapClassnamesToFiles, mapFilesToIdentifiers) {
  return mapClassnamesToFiles.map(entry => ({
    ...entry,
    ...(
      entry.file ? {identifier: mapFilesToIdentifiers.find(({file}) => file === entry.file).identifier} : {}
    )
  }))
}

module.exports = {
  computeMapFileToClassnames,
  computeMapClassnamesToFiles,
  genComputeMapFilesToIdentifiers,
  computeMapClassnamesToFilesAndIdentifiers,
  computeUsedFiles
};
