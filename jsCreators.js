function createCSSModuleAttributeValue(mapClassnamesToFiles) {
  const t = this.types;

  // handle single classname case
  if (mapClassnamesToFiles.length === 1) {
    return t.JSXExpressionContainer(
      t.MemberExpression(
        t.Identifier(mapClassnamesToFiles[0].identifier),
        t.Identifier(mapClassnamesToFiles[0].classname)
      )
    );
  }

  // calculate template literal
  const templateElementsValues = mapClassnamesToFiles
    .map(({classname, file}) => file ? '|' : classname)
    .join(' ')
    .split('|');

  // handle multiple classnames case
  return t.JSXExpressionContainer(
    t.TemplateLiteral(
      templateElementsValues
        .map(value => t.TemplateElement({raw: value, cooked: value})),
      mapClassnamesToFiles
        .filter(({file}) => !!file)
        .map(({classname, identifier}) => t.MemberExpression(
          t.Identifier(identifier),
          t.Identifier(classname)
          )
        )
    )
  );
}

function createCSSModuleImportStatements(mapFilestoIdentifiers) {
  const t = this.types;
  return mapFilestoIdentifiers.map(
    ({identifier: specifier, file: source}) => (
      t.ImportDeclaration([t.ImportDefaultSpecifier(t.Identifier(specifier))], t.StringLiteral(source))
    )
  )
}

module.exports = {createCSSModuleAttributeValue, createCSSModuleImportStatements};
