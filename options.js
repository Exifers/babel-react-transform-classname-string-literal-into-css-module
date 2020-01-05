const k = require("./keys");
const {genComputeMapFilesToIdentifiers} = require("./computers");
const {addPropertyIdentifierToClassnames} = require("./computers");
const {addObjectIdentifierToClassnames} = require("./computers");
const {toCamelCaseSoft} = require("./cases");
const {createCSSModuleImportStatements} = require("./jsCreators");
const {classnamesCSSASTExtractor} = require("./cssExtractors");
const {createCSSModuleAttributeValue} = require("./jsCreators");
const {computeMapClassnamesToFiles} = require("./computers");
const {classnameValueASTExtractor} = require("./jsExtractors");
const {computeMapFileToClassnames} = require("./computers");
const {readFilesContents} = require("./io");

const defaultOptions = {
  // AST creators
  [k.createCSSModuleAttributeValue]: createCSSModuleAttributeValue,
  [k.createCSSModuleImportStatements]: createCSSModuleImportStatements,

  // AST extractors
  [k.classnameValueASTExtractor]: classnameValueASTExtractor,
  [k.classnamesCSSASTExtractor]: classnamesCSSASTExtractor,

  // functional
  [k.readFilesContents]: readFilesContents,
  [k.computeMapFileToClassnames]: computeMapFileToClassnames,
  [k.addFilesToClassnames]: computeMapClassnamesToFiles,
  [k.addObjectIdentifierToClassnames]: addObjectIdentifierToClassnames,
  [k.addPropertyIdentifierToClassnames]: addPropertyIdentifierToClassnames,
  [k.genComputeMapFilesToIdentifiers]: genComputeMapFilesToIdentifiers,

  [k.computeLocalClassnameValue]: k.camelCaseKeepFirstCharCase
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
