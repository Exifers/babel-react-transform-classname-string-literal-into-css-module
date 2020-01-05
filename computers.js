const css = require("css");
const path = require("path");
const k = require("./keys");
const {classnamesCSSASTExtractor} = require('./cssExtractors');

function computeMapFileToClassnames(mapFilesToContents) {
  let mapFileToClassnames = new Map();
  for (const {file, content} of mapFilesToContents) {
    const parsed = css.parse(content);
    mapFileToClassnames.set(file, this.optionsDefaulter.get('classnamesCSSASTExtractor')(parsed));
  }
  return mapFileToClassnames;
};

function computeFileFromClassname(classname) {
  const mapFileToClassnames = this.mapFileToClassnames;
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

function addFilesToClassnames(classnames) {
  return classnames.map(entry => ({
    ...entry,
    file: computeFileFromClassname.call(this, entry.classname)
  }))
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

function addObjectIdentifierToClassnames(classnames) {
  const mapFilesToIdentifiers = this.mapFilesToIdentifiers;
  return classnames.map(entry => ({
    ...entry,
    ...(
      entry.file ? {objectIdentifier: mapFilesToIdentifiers.find(({file}) => file === entry.file).identifier} : {}
    )
  }))
}

function addPropertyIdentifierToClassnames(classnames) {
  return classnames.map(entry => ({
    ...entry,
    propertyIdentifier: this.optionsDefaulter.get(k.computeLocalClassnameValue)(entry.classname)
  }))
}

function addPathsToClassnames(classnames) {
  const jsxFilePath = this.optionsDefaulter.get(k.jsxFilePath);
  return classnames.map(entry => ({
    ...entry,
    ...(entry.file ? {
      path: path.relative(path.dirname(jsxFilePath), entry.file)
    } : {})
  }))
}

module.exports = {
  computeMapFileToClassnames,
  computeMapClassnamesToFiles: addFilesToClassnames,
  genComputeMapFilesToIdentifiers,
  addObjectIdentifierToClassnames,
  computeUsedFiles,
  addPropertyIdentifierToClassnames,
  addPathsToClassnames
};
