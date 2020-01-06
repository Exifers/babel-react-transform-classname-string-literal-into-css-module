let keys = {
  createCSSModuleAttributeValue: '',
  createCSSModuleImportStatements: '',

  classnameValueASTExtractor: '',

  computeLocalClassnameValue: '',

  genComputeMapFilesToIdentifiers: '',

  addFilesToClassnames: '',
  addObjectIdentifierToClassnames: '',
  addPropertyIdentifierToClassnames: '',
  addPathsToClassnames: '',

  jsxFilePath: '',
  stylesFilesData: '',

  // cases
  camelCase: '',
  camelCaseKeepFirstCharCase: '',

  pascalCase: '',

  // debug
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
