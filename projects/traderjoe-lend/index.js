const { compoundExports2 } = require('../helper/compound');

module.exports = {
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
  avax: compoundExports2({ comptroller: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC', cether: '0xC22F01ddc8010Ee05574028528614634684EC29e' }),
};
