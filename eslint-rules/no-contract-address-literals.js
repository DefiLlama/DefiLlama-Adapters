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
      description: 'Disallow use of string literals of addresses with a defined constant.',
      recommended: true
    },
    fixable: 'code'
  },
  create: function(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') {
          return
        } 

        const nodeVal = node.value.toLowerCase();
        if (addresses.has(nodeVal)) {
          const isObjectKey = node.parent?.type === 'Property'

          const symbol = addressToSymbol.get(nodeVal);

          const fix = (fixer) => {
            let constantReference = `DEFINED_ADDRESSES.${symbol}`;
            if (isObjectKey) {
              constantReference = `[${constantReference}]`;
            }
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

