const classnameValueASTExtractor = (attribute) => {
  let value = null;
  switch (attribute.value.type) {
    case 'StringLiteral':
      value = attribute.value.value;
      break;
    case 'JSXExpressionContainer':
      const expression = attribute.value.expression;
      if (expression.type === 'StringLiteral') {
        value = expression.value;
      }
      break;
  }
  return value;
};

module.exports = {classnameValueASTExtractor};
