let keys = {
  createCSSModuleAttributeValue: '',
  createCSSModuleImportStatements: '',
  classnameValueASTExtractor: '',
  classnamesCSSASTExtractor: '',
  readFilesContents: '',
  computeMapFileToClassnames: '',
  addFilesToClassnames: '',
  computeLocalClassnameValue: '',
  addObjectIdentifierToClassnames: '',
  addPropertyIdentifierToClassnames: '',
  genComputeMapFilesToIdentifiers: '',
  addPathsToClassnames: '',

  // cases
  camelCase: '',
  camelCaseKeepFirstCharCase: '',
  pascalCase: '',

  // paths
  filesPaths: '',
  jsxFilePath: ''
};


for (const [key] of Object.entries(keys)) {
  keys[key] = key;
}

module.exports = keys;
