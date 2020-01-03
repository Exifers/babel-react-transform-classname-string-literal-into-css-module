const mutateClassnameToCSSModules = (attribute, mapClassnamesToFiles) => {

  // handle single classname case
  if (mapClassnamesToFiles.size === 1) {
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
          name: Array.from(mapClassnamesToFiles.keys())[0]
        },
        computed: false
      }
    };
    return;
  }

  // calculate template literal
  const templateElementsValues = Array.from(mapClassnamesToFiles.entries())
    .map(([classname, file]) => file ? '|' : classname)
    .join(' ')
    .split('|');

  // handle multiple classnames case
  attribute.value = {
    type: 'JSXExpressionContainer',
    expression: {
      type: 'TemplateLiteral',
      expressions: (
        Array.from(mapClassnamesToFiles.keys())
          .filter(classname => !!mapClassnamesToFiles.get(classname))
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
              // TODO find out difference between raw and cooked
              raw: templateElementValue,
              cooked: templateElementValue
            },
            tail: (
              !!Array.from(mapClassnamesToFiles.values())
                [mapClassnamesToFiles.size - 1]
                ? false
                : index === templateElementsValues.length - 1
            )
          }))
      )
    }
  }
};

module.exports = {mutateClassnameToCSSModules};
