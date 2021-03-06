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
  camelCaseSoft: '',

  pascalCase: '',

  // debug
  debug: '',
  expandObjects: '',
  // debug namespaces keys
  prepare: '',
  parse: '',
  extract: '',
  compute: '',

  create: '',
  identity: '',

  useComputedMemberExpression: ''
};


for (const [key] of Object.entries(keys)) {
  if (!keys[key]) {
    keys[key] = key;
  }
}

module.exports = keys;
