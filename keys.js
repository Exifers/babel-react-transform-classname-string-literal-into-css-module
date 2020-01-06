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
  jsxFilePath: '',

  debug: '',

  // debug namespaces keys
  prepare: '',
  parse: '',
  extract: '',
  compute: '',
  create: ''
};


for (const [key] of Object.entries(keys)) {
  if (!keys[key]) {
    keys[key] = key;
  }
}

module.exports = keys;
