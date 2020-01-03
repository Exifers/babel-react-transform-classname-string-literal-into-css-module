const mutateClassnameToCSSModules = (attribute, mapClassnamesToFiles) => {

  // handle single classname case
  if (Object.values(mapClassnamesToFiles).length === 1) {
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
          name: Object.keys(mapClassnamesToFiles)[0]
        },
        computed: false
      }
    };
    return;
  }

  // calculate template literal
  const templateElementsValues = Object.entries(mapClassnamesToFiles)
    .map(([classname, file]) => file ? '|' : classname)
    .join(' ')
    .split('|');

  // handle multiple classnames case
  attribute.value = {
    type: 'JSXExpressionContainer',
    expression: {
      type: 'TemplateLiteral',
      expressions: (
        Object.keys(mapClassnamesToFiles)
          .filter(classname => !!mapClassnamesToFiles[classname])
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
              !!Object.values(mapClassnamesToFiles)
                [Object.keys(mapClassnamesToFiles).length - 1]
                ? false
                : index === templateElementsValues.length - 1
            )
          }))
      )
    }
  }
};

module.exports = {mutateClassnameToCSSModules};
