const babel = require('@babel/core');
const css = require('css');
const {computeMapFileToClassnames, computeMapClassnamesToFiles} = require('./computers');
const {readFiles} = require('./io');
const {classnameValueASTExtractor} = require('./jsExtractors');
const {mutateClassnameToCSSModules} = require('./jsMutators');

//TODO: camelization, import, extract classname from selector

// Convert CSS classname into CSS module classname
// This basically converts into camel case but keeping the original case
// of the first letter
const toCamelCaseSoft = input =>
  input
    .split(/[\-.]+/)
    .filter(s => s.length)
    .reduce(
      (a, c, i) =>
        i === 0
          ? a + c
          : !!a.match(/[a-zA-Z0-9]$/)
          ? a + c[0].toUpperCase() + c.substring(1)
          : a + c,
      ''
    );

const myPlugin = function () {
  return {
    pre() {
      const fileContents = readFiles(['styles.css']);
      this.mapFileToClassnames = computeMapFileToClassnames(fileContents);
    },
    visitor: {
      JSXAttribute(path) {
        const attribute = path.node;
        if (attribute.name.name !== 'className') {
          return;
        }

        const classnameValue = classnameValueASTExtractor(attribute);
        if (!classnameValue) {
          return;
        }

        const classnames = classnameValue.split(' ').filter(Boolean);
        if (classnames.length === 0) {
          return;
        }
        const mapClassnamesToFiles = computeMapClassnamesToFiles(classnames, this.mapFileToClassnames);
        if (!Object.values(mapClassnamesToFiles).find(Boolean)) {
          return;
        }
        mutateClassnameToCSSModules(attribute, mapClassnamesToFiles);
      }
    }
  }
};

// === Workbench ===

const code = `
// this is a comment
let a = <div className='bonjour'>Hi</div>;
let b = <div className={'bonjour2'}>Hi</div>;
let c = <div className='bonjour3'/>;
let d = <div className={1}>Hi</div>;
let e = <div className={"bonjour4"}>Hi</div>;
let f = <div className2={"hello"}>Hi</div>;
let g = <div className={'hello-everyone'}>Hi</div>;
let h = <div className={"bonjour5"}>Hi</div>;
let i = <div className={"a bonjour5 b c  d bonjour2  e"}>Hi</div>;
let j = <div className={"bonjour3 bonjour5 bonjour2"}>Hi</div>;
let k = <div className2={"bonjour3 bonjour5 bonjour2"}>Hi</div>;
`;

const out_example = `
let a = <div className={\`\${styles.bonjour} \${styles.bonjour2} a\`}/>;
`

const options = {
  plugins: [
    "@babel/plugin-syntax-jsx",
    myPlugin
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
    parsed_out_example.program.body[0].declarations[0].init,
    null,
    4
  )
);
*/
