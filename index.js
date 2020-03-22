const {computeUsedFiles} = require("./computers");
const {OptionsDefaulter} = require("./options");
const k = require('./keys');
const _ = require('./debug');

function reactTransformClassnameStringLiteralIntoCSSModules({types}) {
  return {
    inherits: require("@babel/plugin-syntax-jsx").default,

    pre() {
      this.optionsDefaulter = new OptionsDefaulter(this.opts);

      if (this.optionsDefaulter.get(k.debug)) {
        _.enable()
      }
      _.log(1, k.prepare, 'Reading options');
      this.stylesFilesData = this.optionsDefaulter.get(k.stylesFilesData);
      _.log(1, k.prepare, 'Got: ' + JSON.stringify(this.optionsDefaulter.getAll()));

      this.computeMapFilesToIdentifiers = this.optionsDefaulter.get(k.genComputeMapFilesToIdentifiers)();
      this.computeMapFilesToIdentifiers.next();
      this.mapPathsToIdentifiers = [];

      this.types = types;
    },

    visitor: {
      JSXAttribute(path, state) {
        const attribute = path.node;
        if (attribute.name.name !== 'className') {
          return;
        }
        _.log(1, k.parse, 'Found classname attribute in %s', this.opts.jsxFilePath);

        _.log(2, k.extract, 'Extracting classname attribute value');
        const classnameValue = this.optionsDefaulter.get(k.classnameValueASTExtractor)(attribute);
        _.log(2, k.extract, 'Got %s', classnameValue);
        if (!classnameValue) {
          return;
        }

        _.log(1, k.compute, 'Compute classnames object');
        let classnames = classnameValue.split(' ').filter(Boolean).map(classname => ({classname}));
        _.log(1, k.compute, 'Got %s', classnames);
        if (classnames.length === 0) {
          _.log(1, k.compute, 'classnames has 0 length, skipping');
          return;
        }

        _.log(2, k.compute, 'Adding styles files to classnames');
        classnames = this.optionsDefaulter.get(k.addFilesToClassnames).call(this, classnames);
        _.log(2, k.compute, 'Got %s', classnames);
        if (classnames.every(({file}) => !file)) {
          _.log(2, k.compute, 'No matching styles files could be found, skipping');
          return;
        }

        _.log(2, k.compute, 'Adding paths to classnames');
        classnames = this.optionsDefaulter.get(k.addPathsToClassnames).call(this, classnames);
        _.log(2, k.compute, 'Got %s', classnames);

        _.log(0, k.compute, 'Computing used files');
        const usedPaths = computeUsedFiles(classnames);
        _.log(0, k.compute, 'Got %s', usedPaths);
        _.log(1, k.compute, 'Computing files identifiers');
        this.mapPathsToIdentifiers = this.computeMapFilesToIdentifiers.next(usedPaths).value;
        _.log(1, k.compute, 'Got %s', this.mapPathsToIdentifiers);

        _.log(0, k.compute, 'Adding object identifiers to classnames');
        classnames = this.optionsDefaulter.get(k.addObjectIdentifierToClassnames).call(this, classnames);
        _.log(0, k.compute, 'Got %s', classnames);

        _.log(0, k.compute, 'Adding property identifiers to classnames');
        classnames = this.optionsDefaulter.get(k.addPropertyIdentifierToClassnames).call(this, classnames);
        _.log(0, k.compute, 'Got %s', classnames);

        _.log(1, k.create, 'Creating and inserting AST');
        attribute.value = this.optionsDefaulter.get(k.createCSSModuleAttributeValue)
          .call(this, classnames);
      }
    },

    post() {
      _.log(1, k.create, 'Creating and inserting AST for import statements');
      const importStatements = this.optionsDefaulter.get(k.createCSSModuleImportStatements)
          .call(this, this.mapPathsToIdentifiers);

      let insertIndex = this.file.ast.program.body.findIndex(node => node.type !== 'ImportDeclaration');
      insertIndex = insertIndex === -1 ? importStatements.length : insertIndex;
      this.file.ast.program.body.splice(insertIndex, 0, ...importStatements);
    }
  }
}

module.exports = reactTransformClassnameStringLiteralIntoCSSModules;
