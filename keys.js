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

  // cases
  camelCase: '',
  camelCaseKeepFirstCharCase: '',
  pascalCase: '',

  filesPaths: ''
};


for (const [key] of Object.entries(keys)) {
  keys[key] = key;
}

module.exports = keys;
