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
            replaceText = `${firstArgText}.map(${secondArgText})`;
            break;
          case 'Identifier':
            const ancestors = context.getAncestors(node);
            const isArrayStr = `Array.isArray(${firstArgText})`;
            // пробегаемся по родительским всем блокам, вдруг мы уже проводили проверки вида Array.isArray(firstArg)
            for (let i = ancestors.length - 1; i >= 0; i--) {
              const ancestor = ancestors[i];
              const { type } = ancestor;
              // проверка что мы в тернарном выражении
              if (type === 'ConditionalExpression'
                && srcCode.getText(ancestor.test) === isArrayStr) {
                return;
              }
    
              // проверка на то что мы в ифе
              if ((type === 'IfStatement')
                && (srcCode.getText(ancestor.test).indexOf(isArrayStr) !== -1)) {
                  return;
                  //  супер тупой способ, но чет не нашел в доке как адекватно получить
                  // все что внутри IfStatement
              }
            }
            // решил вовзращать тернарку вместо стандартного ifa, так немного легче
            // + не слетает форматирование, когда в 1 строку
            replaceText = `(Array.isArray(${firstArgText})) ? ${firstArgText}.map(${secondArgText}) : _map(${firstArgText}, ${secondArgText})`;
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