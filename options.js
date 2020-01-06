const k = require("./keys");
const {addPathsToClassnames} = require("./computers");
const {genComputeMapFilesToIdentifiers} = require("./computers");
const {addPropertyIdentifierToClassnames} = require("./computers");
const {addObjectIdentifierToClassnames} = require("./computers");
const {toCamelCaseSoft} = require("./cases");
const {createCSSModuleAttributeValue, createCSSModuleImportStatements} = require("./creators");
const {computeMapClassnamesToFiles: addFilesToClassnames} = require("./computers");
const {classnameValueASTExtractor} = require("./extractors");

const defaultOptions = {
  // AST creators
  [k.createCSSModuleAttributeValue]: createCSSModuleAttributeValue,
  [k.createCSSModuleImportStatements]: createCSSModuleImportStatements,

  // AST extractors
  [k.classnameValueASTExtractor]: classnameValueASTExtractor,

  // functional
  [k.addFilesToClassnames]: addFilesToClassnames,
  [k.addObjectIdentifierToClassnames]: addObjectIdentifierToClassnames,
  [k.addPropertyIdentifierToClassnames]: addPropertyIdentifierToClassnames,
  [k.genComputeMapFilesToIdentifiers]: genComputeMapFilesToIdentifiers,
  [k.addPathsToClassnames]: addPathsToClassnames,

  // paths
  [k.filesPaths]: [],
  [k.jsxFilePath]: '',

  // filesData
  // example: [
  //   {
  //     path: 'src/css/styles.css', // relative to cwd
  //     classnames: ['foo', 'bar-baz']
  //   }
  // ]
  [k.stylesFilesData]: [],

  [k.computeLocalClassnameValue]: k.camelCaseKeepFirstCharCase,

  [k.debug]: false
};

const references = [
  {
    optionKey: k.computeLocalClassnameValue,
    values: {
      [k.camelCase]: _ => _,
      [k.camelCaseKeepFirstCharCase]: toCamelCaseSoft,
      [k.pascalCase]: _ => _
    }
  }
];

class OptionsDefaulter {
  constructor(userOptions) {
    this.userOptions = userOptions;
  }

  get(optionKey) {
    const optionValue = this.userOptions[optionKey] || defaultOptions[optionKey];
    return this.processReferences(optionKey, optionValue);
  }

  processReferences(optionKey, optionValue) {
    if (typeof optionKey !== 'string') {
      return optionValue;
    }

    const reference = references.find(reference => reference.optionKey === optionKey);
    if (!reference) {
      return optionValue;
    }

    return reference.values[optionValue] || optionValue;
  }
}

module.exports = {OptionsDefaulter};
