const {computeUsedFiles} = require("./computers");
const {OptionsDefaulter} = require("./options");
const k = require('./keys');
const {resolveFilesPaths} = require("./resolver");

//TODO: extract classname properly from selector

function reactTransformClassnameStringLiteralIntoCSSModules({types}) {
  return {
    inherits: require("@babel/plugin-syntax-jsx").default,

    pre(state) {
      this.optionsDefaulter = new OptionsDefaulter(state.opts);

      const filesPaths = resolveFilesPaths();
      const mapFileToContents = this.optionsDefaulter.get(k.readFilesContents)(this.optionsDefaulter.get(k.filesPaths));
      this.mapFileToClassnames = this.optionsDefaulter.get(k.computeMapFileToClassnames).call(this, mapFileToContents);

      this.computeMapFilesToIdentifiers = this.optionsDefaulter.get(k.genComputeMapFilesToIdentifiers)();
      this.computeMapFilesToIdentifiers.next();
      this.mapFilesToIdentifiers = [];

      this.types = types;
    },

    visitor: {
      JSXAttribute(path) {
        const attribute = path.node;
        if (attribute.name.name !== 'className') {
          return;
        }

        const classnameValue = this.optionsDefaulter.get(k.classnameValueASTExtractor)(attribute);
        if (!classnameValue) {
          return;
        }

        let classnames = classnameValue.split(' ').filter(Boolean).map(classname => ({classname}));
        if (classnames.length === 0) {
          return;
        }

        classnames = this.optionsDefaulter.get(k.addFilesToClassnames).call(this, classnames);
        if (!classnames.find(({file}) => !!file)) {
          return;
        }

        const usedFiles = computeUsedFiles(classnames);
        this.mapFilesToIdentifiers = this.computeMapFilesToIdentifiers.next(usedFiles).value;

        classnames = this.optionsDefaulter.get(k.addObjectIdentifierToClassnames).call(this, classnames);

        classnames = this.optionsDefaulter.get(k.addPropertyIdentifierToClassnames).call(this, classnames);

        attribute.value = this.optionsDefaulter.get(k.createCSSModuleAttributeValue)
          .call(this, classnames);
      }
    },

    post() {
      this.file.ast.program.body.unshift(
        ...this.optionsDefaulter.get(k.createCSSModuleImportStatements)
          .call(this, this.mapFilesToIdentifiers)
      );
    }
  }
}

module.exports = reactTransformClassnameStringLiteralIntoCSSModules;
