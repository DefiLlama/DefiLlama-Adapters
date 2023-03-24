const path = require('path');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Check if the variable DEFINED_ADDRESS is used without being required from the file "utils/constants.js"',
      recommended: true,
    },
    fixable: 'code',
  },
  create: (context) => {
    const cwd = context.getCwd();
    const fileDir = path.parse(context.getPhysicalFilename()).dir;
    const constantsPath = path.resolve(cwd, 'utils/constants.js');
    const relativePath = path.relative(fileDir, constantsPath);
    let isRequired = false;

    return {
      // Checks all require statements to see if utils/constants.js is required and DEFINED_ADDRESSES is imported
      CallExpression: (node) => {
        // Find all 'require' nodes
        if (node.callee?.name === 'require' && node.arguments[0]?.value === relativePath) {

          // Go up the chain to see if DEFINED_ADDRESSES is imported
          const props = node.parent?.id?.properties ?? [];
          for (const prop of props) {
            // check each imported property for a match
            if (prop.value.name === 'DEFINED_ADDRESSES') {
              isRequired = true;
            }
          }
        }
      },

      // Checks for usage of DEFINED_ADDRESSES and ensures utils/constants.js is required it is required
      MemberExpression: (node) => {
        // Get the parent object's name
        const parentObject = node.property.parent?.object?.name;
        if (parentObject === 'DEFINED_ADDRESSES' && !isRequired) {
          // Fix if DEFINED_ADDRESSES is the parent object and utils/constants is not required
          const fix = (fixer) => {
            isRequired = true;

            // Insert the require statement at the top of the file
            const requireStatement = `const { DEFINED_ADDRESSES } = require('${relativePath}');\n`;
            return fixer.insertTextBeforeRange([0, 0], requireStatement);
          };

          context.report({
            node,
            message: 'The variable DEFINED_ADDRESSES is used without being required from the file "utils/constants.js"',
            fix,
          });
        }
      },
    };
  },
};

