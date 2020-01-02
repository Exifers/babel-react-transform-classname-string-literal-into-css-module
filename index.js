const babel = require('@babel/core');
const css = require('css');
const fs = require('fs');
const path = require('path');

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

const computeClassnamesPerFiles = (fileRelPaths) => {
  let classnamesPerFiles = {};
  for (const fileRelPath of fileRelPaths) {
    // reading file
    const filePath = path.join(__dirname, fileRelPath);
    const code = fs.readFileSync(filePath, 'utf-8'); 

    // parsing css
    const parsed = css.parse(code);

    // extracting all selectors from AST
    const rules = parsed.stylesheet.rules;
    let selectors = [];
    for (const rule of rules) {
      selectors = [...selectors, ...rule.selectors];
    }

    const classnameRegex = /^\.[a-zA-Z0-9\-_]+$/;
    const classnames = selectors
      .filter(selector => !!selector.match(classnameRegex))
      .map(e => e.substring(1));

    classnamesPerFiles[fileRelPath] = classnames;
  }
  return classnamesPerFiles;
}

const findClassnameInFile = (classname, classnamesPerFiles) => {
  const matched = Object.entries(classnamesPerFiles).reduce((acc, cur) => {
    const file = cur[0];
    const classnames = cur[1];
    
    const matchedClassnames = classnames.filter(c => c === classname);
    
    if (matchedClassnames.length) {
      acc[file] = matchedClassnames;
    }
    
    return acc;
  }, {});

  if (Object.keys(matched).length === 0) {
    // no classname found
    return null;
  }
  if (Object.keys(matched).length > 1) {
    // conflict accross multiple files
    return Object.keys(matched)[0];
  }
  if (Object.values(matched)[0].length > 1) {
    // conflict inside one file
    return Object.keys(matched)[0];
  } 
  // no conflict
  return Object.keys(matched)[0];
}

const myPlugin = function() {
  return {
    pre() {
      this.classnamesPerFiles = computeClassnamesPerFiles(['styles.css']);
    },
    visitor: {
      JSXElement(path, state) {
        const node = path.node;
        const attributes = node.openingElement.attributes
        const options = state.opts;

        if (attributes.length) {
          for (let attribute of attributes) {
            if (attribute.name.name === 'className') {

              // find attribute value
              let value = null;
              switch (attribute.value.type) {
                case 'StringLiteral':
                  value = attribute.value.value;
                  break;
                case 'JSXExpressionContainer':
                  const expression = attribute.value.expression
                  if (expression.type === 'StringLiteral') {
                    value = expression.value; 
                  }
                  break;
              }

              // process found attribute value
              if (value !== null) {
                const classnames = value.split(' ').filter(c => c.length);
                if (classnames.length > 1) {
                  const classnamesFiles = {};
                  // handle multiple classnames
                  for (const classname of classnames) {
                    const fileRelPath = findClassnameInFile(
                      classname,
                      this.classnamesPerFiles
                    );
                    classnamesFiles[classname] = fileRelPath; // null if file not found
                  }
                  if (Object.keys(classnamesFiles).length > 0) {
                    if (Object.values(classnamesFiles).find(Boolean)) {

                      // calculate template literal
                      let helperArray = [];
                      for (const entry of Object.entries(classnamesFiles)) {
                        const classname = entry[0];
                        const file = entry[1];
                        if (file) {
                          helperArray.push('|');
                        }
                        else {
                          helperArray.push(classname);
                        }
                      }
                      let helperString = helperArray.join(' ')

                      templateElementsValues = helperString.split('|');
                      console.log(templateElementsValues);

                      // mutate AST
                      attribute.value = {
                        type: 'JSXExpressionContainer',
                        expression: {
                          type: 'TemplateLiteral',
                          expressions: (
                            Object.keys(classnamesFiles)
                              .filter(classname => !!classnamesFiles[classname])
                              .map(classname => ({
                                type: 'MemberExpression',
                                object: {
                                  type: 'Identifier',
                                  name: 'styles'
                                },
                                property: {
                                  type: 'Identifier',
                                  name: classname
                                }
                              }))
                          ),
                          quasis: (
                            templateElementsValues
                              .map((templateElementValue, index) => ({
                                type: 'TemplateElement',
                                value: {
                                  // TODO find out difference between raw and
                                  // cooked
                                  raw: templateElementValue,
                                  cooked: templateElementValue
                                },
                                tail: (
                                  !!Object.values(classnamesFiles)
                                  [Object.keys(classnamesFiles).length - 1]
                                  ? false 
                                  : index === templateElementsValues.length - 1 
                                )
                              }))
                          )
                        }
                      }
                      console.log(attribute.value.expression.quasis);
                      // `a ${styles.bonjour5} b c d ${styles.bonjour2} e`
                    }
                  }
                }
                else {
                  const classname = value;
                  const fileRelPath = findClassnameInFile(
                    classname,
                    this.classnamesPerFiles
                  );
                  if (fileRelPath) {
                    // classname exists in one file
                    // mutating the AST
                    attribute.value = {
                      type: 'JSXExpressionContainer',
                      expression: {
                        type: 'MemberExpression',
                        object: {
                          type: 'Identifier',
                          name: 'styles'
                        },
                        property: {
                          type: 'Identifier',
                          name: value
                        },
                        computed: false
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
  }
};

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
