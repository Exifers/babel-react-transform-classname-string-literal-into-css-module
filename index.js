const {computeUsedFiles} = require("./computers");
const {OptionsDefaulter} = require("./options");
const k = require('./keys');
const {resolveFilesPaths} = require("./resolver");
const _ = require('./debug');

//TODO: extract classname properly from selector

function reactTransformClassnameStringLiteralIntoCSSModules({types}) {
  return {
    inherits: require("@babel/plugin-syntax-jsx").default,

    pre() {
      this.optionsDefaulter = new OptionsDefaulter(this.opts);

      if (this.optionsDefaulter.get(k.debug)) {
        _.enable()
      }

      _.log(1, k.prepare, 'Resolving paths');
      const filesPaths = resolveFilesPaths();

      _.log(1, k.prepare, 'Reading styles files');
      const mapFileToContents = this.optionsDefaulter.get(k.readFilesContents)(this.optionsDefaulter.get(k.filesPaths));

      _.log(1, k.prepare, 'Collecting classes');
      this.mapFileToClassnames = this.optionsDefaulter.get(k.computeMapFileToClassnames).call(this, mapFileToContents);

      this.computeMapFilesToIdentifiers = this.optionsDefaulter.get(k.genComputeMapFilesToIdentifiers)();
      this.computeMapFilesToIdentifiers.next();
      this.mapFilesToIdentifiers = [];

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
        if (!classnames.find(({file}) => !!file)) {
          _.log(2, k.compute, 'No matching styles files could be found, skipping');
          return;
        }

        _.log(0, k.compute, 'Computing used files');
        const usedFiles = computeUsedFiles(classnames);
        _.log(0, k.compute, 'Got %s', usedFiles);
        _.log(1, k.compute, 'Computing files identifiers');
        this.mapFilesToIdentifiers = this.computeMapFilesToIdentifiers.next(usedFiles).value;
        _.log(1, k.compute, 'Got %s', this.mapFilesToIdentifiers);

        _.log(0, k.compute, 'Adding object identifiers to classnames');
        classnames = this.optionsDefaulter.get(k.addObjectIdentifierToClassnames).call(this, classnames);
        _.log(0, k.compute, 'Got %s', classnames);

        _.log(0, k.compute, 'Adding property identifiers to classnames');
        classnames = this.optionsDefaulter.get(k.addPropertyIdentifierToClassnames).call(this, classnames);
        _.log(0, k.compute, 'Got %s', classnames);

        _.log(2, k.compute, 'Adding paths to classnames');
        classnames = this.optionsDefaulter.get(k.addPathsToClassnames).call(this, classnames);
        _.log(2, k.compute, 'Got %s', classnames);

        _.log(1, k.create, 'Creating and inserting AST');
        attribute.value = this.optionsDefaulter.get(k.createCSSModuleAttributeValue)
          .call(this, classnames);
      }
    },

    post() {
      _.log(1, k.create, 'Creating and inserting AST for import statements');
      this.file.ast.program.body.unshift(
        ...this.optionsDefaulter.get(k.createCSSModuleImportStatements)
          .call(this, this.mapFilesToIdentifiers)
      );
    }
  }
}

module.exports = reactTransformClassnameStringLiteralIntoCSSModules;
