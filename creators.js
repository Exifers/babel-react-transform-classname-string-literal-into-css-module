const k = require("./keys");

function createCSSModuleAttributeValue(mapClassnamesToFiles) {
  const t = this.types;

  // handle single classname case
  if (mapClassnamesToFiles.length === 1) {
    return t.JSXExpressionContainer(
      createMemberExpression.call(
        this,
        mapClassnamesToFiles[0].objectIdentifier,
        mapClassnamesToFiles[0].propertyIdentifier
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
        .map(({propertyIdentifier, objectIdentifier}) => createMemberExpression.call(this, objectIdentifier, propertyIdentifier)
        )
    )
  );
}

function createMemberExpression(objectIdentifier, propertyIdentifier) {
  const t = this.types;

  const useComputedMemberExpression = this.optionsDefaulter.get(k.useComputedMemberExpression)

  if (useComputedMemberExpression) {
    return t.MemberExpression(
        t.Identifier(objectIdentifier),
        t.StringLiteral(propertyIdentifier),
        true
    )
  }

  return t.MemberExpression(
      t.Identifier(objectIdentifier),
      t.Identifier(propertyIdentifier)
  )
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
