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
  computeMapClassnamesToFiles: computeMapClassnamesToFiles
};

class OptionsDefaulter {
  constructor(userOptions) {
    this.userOptions = userOptions;
  }

  get(optionKey) {
    return this.userOptions[optionKey] || defaultOptions[optionKey];
  }
}

module.exports = {OptionsDefaulter};
