const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

module.exports = mergeExports([
  masterchefExports({
    chain: 'cronos',
    masterchef: '0xBD124D3B18a382d807a9E491c7f1848403856B08',
    nativeToken: '0x637CB66526244029407046867E1E0DFD28b2294E',
  }),
  masterchefExports({
    chain: 'fantom',
    masterchef: '0xdA2A9024D8D01F4EA0aa35EEdf771432095219ef',
    nativeToken: '0xa26e2D89D4481500eA509Df58035073730cff6D9',
  }),
  masterchefExports({
    chain: 'polygon',
    masterchef: '0x53D392646faB3caE0a08Ead31f8B5cBFFf55b818',
    nativeToken: '0xf5291e193aad73cac6fd8371c98804a46c6c6577',
  }),
])