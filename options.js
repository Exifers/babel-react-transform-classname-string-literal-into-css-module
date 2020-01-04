const {createCSSModuleImportStatements} = require("./jsCreators");
const {classnamesCSSASTExtractor} = require("./cssExtractors");
const {createCSSModuleAttributeValue} = require("./jsCreators");
const {computeMapClassnamesToFiles} = require("./computers");
const {classnameValueASTExtractor} = require("./jsExtractors");
const {computeMapFileToClassnames} = require("./computers");
const {readFilesContents} = require("./io");

const defaultOptions = {
  // AST creators
  createCSSModuleAttributeValue: createCSSModuleAttributeValue,
  createCSSModuleImportStatements: createCSSModuleImportStatements,

  // AST extractors
  classnameValueASTExtractor: classnameValueASTExtractor,
  classnamesCSSASTExtractor: classnamesCSSASTExtractor,

  // functional
  readFilesContents: readFilesContents,
  computeMapFileToClassnames: computeMapFileToClassnames,
  computeMapClassnamesToFiles: computeMapClassnamesToFiles,

  localsConvention: 'camelCase'
};

const shortcuts = [
  {
    optionKey: 'localsConvention',
    values: {
      'camelCase': _ => _,
      'camelCaseKeepFirstCharCase': _ => _,
      'pascalCase': _ => _
    }
  }
];

class OptionsDefaulter {
  constructor(userOptions) {
    this.userOptions = userOptions;
  }

  get(optionKey) {
    const optionValue = this.userOptions[optionKey] || defaultOptions[optionKey];
    return this.processShortcuts(optionKey, optionValue);
  }

  processShortcuts(optionKey, optionValue) {
    if (typeof optionKey !== 'string') {
      return optionValue;
    }

    const shortcut = shortcuts.find(shortcut => shortcut.optionKey === optionKey);
    if (!shortcut) {
      return optionValue;
    }

    return shortcut.values[optionValue] || optionValue;
  }
}

module.exports = {OptionsDefaulter};
