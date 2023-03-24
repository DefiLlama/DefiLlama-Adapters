const { DEFINED_ADDRESSES } = require('../utils/constants');

const addresses = new Set(Object.values(DEFINED_ADDRESSES));
const addressToSymbol = new Map();

for (const [k, v] of Object.entries(DEFINED_ADDRESSES)) {
  addressToSymbol.set(v, k);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow use of string literals of addresses with a constant defined in utils/constants.js.',
      recommended: true
    },
    fixable: 'code'
  },
  create: function(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') {
          // Skip nodes that are not strings
          return
        }

        const nodeVal = node.value.toLowerCase(); // potential address literal
        if (addresses.has(nodeVal)) {
          // check if literal is an object key, the fix will include brackets
          const isObjectKey = node.parent?.type === 'Property' && node.parent.key === node;

          // fetch the symbol of the address (object key)
          const symbol = addressToSymbol.get(nodeVal);

          const fix = (fixer) => {
            let constantReference = `DEFINED_ADDRESSES.${symbol}`;
            if (isObjectKey) {
              // object keys require brackets eg:
              // { [DEFINED_ADDRESSES.USDC]: 'stable' }
              constantReference = `[${constantReference}]`;
            }

            // the character range of the detected node
            const start = node.range[0];
            const end = node.range[1];

            return fixer.replaceTextRange([start, end], constantReference);
          };

          context.report({
            node,
            message: 'USDC address literal defined, please require utils/constants.js and import DEFINED_ADDRESSES',
            fix
          });
        }
      }
    };
  }
};

