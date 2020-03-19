module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Replace lodash _.map to native functions',
      category: 'Lodash',
      recommended: false
    },
    fixable: 'code',
    schema: []
  },
  create: function(context) {
    const reassignScopes = new Set(); 
    return {
      'VariableDeclarator[id.name="_"]'(node) {
        // находим области видимости, где был переопределен _
        reassignScopes.add(context.getScope(node));
      },
      'CallExpression[arguments.length > 1][callee.object.name="_"][callee.property.name="map"]'(node) {
        const nodeScope = context.getScope(node);
        // проверяем если в текущей или внешних областях видимости переопределен _
        if (reassignScopes.has(nodeScope)) {
          return;
        }

        let upperScope = nodeScope.upperScope;
        while(upperScope) {
          if (reassignScopes.has(nodeScope)) {
            return; 
          }
          upperScope = upperScope.upperScope;
        }
        const args = node.arguments;
        const [firstArg, secondArg] = args;
        const srcCode = context.getSourceCode();
        const firstArgText = srcCode.getText(firstArg);
        const secondArgText = srcCode.getText(secondArg);
        let replaceText = '';
        switch(firstArg.type) {
          case 'ArrayExpression':
            replaceText = `${secondArgText}.map(${secondArgText})`;
            break;
          case 'Identifier':
            replaceText = `(Array.isArray(${firstArgText})) ? ${firstArgText}.map(${secondArgText}) : _map(${firstArgText}, ${secondArgText});`;
            break;
          default:
            return;
        }

        context.report({
          node,
          message: 'Replace _.map to native code',
          fix: function(fixer) {
            return fixer.replaceText(node, replaceText);
          }
        });
      }
    };
  }
}