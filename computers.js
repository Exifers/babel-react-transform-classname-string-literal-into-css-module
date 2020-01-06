const css = require("css");
const path = require("path");
const k = require("./keys");

function computeFileFromClassname(classname) {
  const stylesFilesData = this.stylesFilesData;
  const matched = new Map();

  for (const {path, classnames} of stylesFilesData) {
    const matchedClassnames = classnames.filter(c => c === classname);
    if (matchedClassnames.length) {
      matched.set(path, matchedClassnames);
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
  let pathsToIdentifiers = [];
  let newPaths = [];
  let index = 1;
  while (true) {
    pathsToIdentifiers = [
      ...pathsToIdentifiers,
      ...newPaths
        .filter(newPath => !pathsToIdentifiers.find(({path}) => path === newPath))
        .map(path => ({path, identifier: 'styles' + index++}))
    ];
    newPaths = yield pathsToIdentifiers;
  }
}

function computeUsedFiles(mapClassnamesToFiles) {
  return mapClassnamesToFiles
    .map(({path}) => path)
    .filter(Boolean)
    .filter((path, index, array) => array.indexOf(path) === index)
}

function addObjectIdentifierToClassnames(classnames) {
  const mapPathsToIdentifiers = this.mapPathsToIdentifiers;
  return classnames.map(entry => ({
    ...entry,
    ...(
      entry.path ? {objectIdentifier: mapPathsToIdentifiers.find(({path}) => path === entry.path).identifier} : {}
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
  computeMapClassnamesToFiles: addFilesToClassnames,
  genComputeMapFilesToIdentifiers,
  addObjectIdentifierToClassnames,
  computeUsedFiles,
  addPropertyIdentifierToClassnames,
  addPathsToClassnames
};
