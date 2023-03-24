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
        if (node.value === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' || node.value === '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48') {
          const fix = (fixer) => {
            const constantReference = 'DEFINED_ADDRESSES.USDC';
            const start = node.range[0];
            const end = node.range[1];

            return fixer.replaceTextRange([start, end], constantReference);
          };

          context.report({
            node,
            message: 'USDC address literal defined, please require and use the defined constant.',
            fix
          });
        }
      }
    };
  }
};

