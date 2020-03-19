module.exports = {
  meta: {
    type: '',
    docs: {
      description: "Replace lodash _.map to native functions",
      category: "Lodash",
      recommended: false
    },
    fixable: 'code',
    schema: []
  },
  create: function(context) {
    let firstReassignLoc = null;
    return {
      'VariableDeclarator[id.name="_"]'(node) {
        if (firstReassignLoc !== null) {
          return;
        }
        
        firstReassignLoc = node.loc;
      },
      'CallExpression[arguments.length > 1][callee.object.name="_"][callee.property.name="map"]'(node) {
        if (firstReassignLoc !== null 
          && firstReassignLoc.start <= node.loc.start) {
          return;
        }
        const args = node.arguments;
        const [firstArg, secondArg] = args;
        const srcCode = context.getSourceCode();
        const firstArgText = srcCode.getText(firstArg);
        const secondArgText = srcCode.getText(secondArg);
       
        let replaceText = null;
        switch(firstArg.type) {
          case 'ArrayExpression':
            replaceText = `${firstArgValue}.map(${secondArgValue})`;
            break;
          case 'Identifier':
            replaceText = `(Array.isArray(${firstArgText})) ? ${firstArgText}.map(${secondArgText}) : _map(${firstArgText}, ${secondArgText});`;
            break;
          default:
            return;
        }
        
        if (replaceText === null) {
           return; 
        }
        context.report({
          node,
          message: "Replace _.map to native code",
          fix: function(fixer) {
            return fixer.replaceText(node, replaceText);
          }
        });
      }
    };  
  }
}