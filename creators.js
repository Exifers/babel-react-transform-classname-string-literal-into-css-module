function createCSSModuleAttributeValue(mapClassnamesToFiles) {
  const t = this.types;

  // handle single classname case
  if (mapClassnamesToFiles.length === 1) {
    return t.JSXExpressionContainer(
      t.MemberExpression(
        t.Identifier(mapClassnamesToFiles[0].objectIdentifier),
        t.Identifier(mapClassnamesToFiles[0].propertyIdentifier)
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
        .map(({propertyIdentifier, objectIdentifier}) => t.MemberExpression(
          t.Identifier(objectIdentifier),
          t.Identifier(propertyIdentifier)
          )
        )
    )
  );
}

function createCSSModuleImportStatements(mapPathsToIdentifiers) {
  const t = this.types;
  return mapPathsToIdentifiers.map(
    ({identifier: specifier, path: source}) => (
      t.ImportDeclaration([t.ImportDefaultSpecifier(t.Identifier(specifier))], t.StringLiteral(source))
    )
  )
}

module.exports = {createCSSModuleAttributeValue, createCSSModuleImportStatements};
