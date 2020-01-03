const classnamesCSSASTExtractor = (cssAST) => {
  // extracting all selectors from AST
  const rules = cssAST.stylesheet.rules;
  let selectors = [];
  for (const rule of rules) {
    selectors = [...selectors, ...rule.selectors];
  }

  const classnameRegex = /^\.[a-zA-Z0-9\-_]+$/;
  return selectors
    .filter(selector => !!selector.match(classnameRegex))
    .map(e => e.substring(1));
};

module.exports = {classnamesCSSASTExtractor};
