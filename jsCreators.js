function createCSSModuleAttributeValue(mapClassnamesToFiles) {
  const t = this.types;

  // handle single classname case
  if (mapClassnamesToFiles.size === 1) {
    return t.JSXExpressionContainer(
      t.MemberExpression(
        t.Identifier('styles'),
        t.Identifier(Array.from(mapClassnamesToFiles.keys())[0])
      )
    );
  }

  // calculate template literal
  const templateElementsValues = Array.from(mapClassnamesToFiles.entries())
    .map(([classname, file]) => file ? '|' : classname)
    .join(' ')
    .split('|');

  // handle multiple classnames case
  return t.JSXExpressionContainer(
    t.TemplateLiteral(
      templateElementsValues
        .map(value => t.TemplateElement({raw: value, cooked: value})),
      Array.from(mapClassnamesToFiles.keys())
        .filter(classname => !!mapClassnamesToFiles.get(classname))
        .map(classname => t.MemberExpression(
          t.Identifier('styles'),
          t.Identifier(classname))
        )
    )
  );
}

module.exports = {createCSSModuleAttributeValue};
