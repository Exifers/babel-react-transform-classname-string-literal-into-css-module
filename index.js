const babel = require('@babel/core');
const css = require('css');
const {genComputeMapFilesToIdentifiers} = require("./computers");
const {computeUsedFiles} = require("./computers");
const {addObjectIdentifierToClassnames, addPropertyIdentifierToClassnames} = require("./computers");
const {OptionsDefaulter} = require("./options");
const k = require('./keys');

//TODO: camelization, import, extract classname from selector

const reactTransformClassnameStringLiteralIntoCSSModules = ({types}) => ({

  inherits: require("@babel/plugin-syntax-jsx").default,

  pre(state) {
    this.optionsDefaulter = new OptionsDefaulter(state.opts);

    const mapFileToContents = this.optionsDefaulter.get(k.readFilesContents)(['styles.css', 'styles2.css']);
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

      classnames= this.optionsDefaulter.get(k.addPropertyIdentifierToClassnames).call(this, classnames);

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
});

// === Workbench ===

const code = `
// this is a comment
let a = <div className='bonjour'>Hi</div>;
let b = <div className={'bonjour2'}>Hi</div>;
let c = <div className='bonjour3'/>;
let d = <div className={1}>Hi</div>;
let e = <div className={"bonjour4"}>Hi</div>;
let f = <div className={"hello"}>Hi</div>;
let f2 = <div className2={"hello"}>Hi</div>;
let g = <div className={'hello-everyone'}>Hi</div>;
let h = <div className={"bonjour5"}>Hi</div>;
let i = <div className={"a bonjour5 b c  d bonjour2  e"}>Hi</div>;
let j = <div className={"bonjour3 bonjour5 bonjour2"}>Hi</div>;
let k = <div className2={"bonjour3 bonjour5 bonjour2"}>Hi</div>;
`;

const out_example = `
import foo from 'bar';
let a = <div className={\`\${styles.bonjour} \${styles.bonjour2} a\`}/>;
`;

const options = {
  plugins: [
    reactTransformClassnameStringLiteralIntoCSSModules
  ]
};

const parsed = babel.parse(
  code,
  options
);

const out = babel.transform(
  code,
  options
);

const parsed_out_example = babel.parse(
  out_example,
  options
);

const css_code = `
  hello {
    color: red;
  }
`;

const parsed_css = css.parse(css_code);

//console.log(JSON.stringify(parsed.program.body[0].declarations[0].init, null, 4));
console.log(out);

/*
console.log(
  JSON.stringify(
    parsed_out_example,
    null,
    4
  )
);
*/
