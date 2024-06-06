const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getCompoundV2Tvl } = require('../helper/compound');

const comptroller = "0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC";

module.exports = {
      methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
  avax:{
    tvl: getCompoundV2Tvl(
        comptroller, 
        "avax", 
        addr => `avax:${addr}`, 
        "0xC22F01ddc8010Ee05574028528614634684EC29e", 
        ADDRESSES.avax.WAVAX,
        false
    ),
    borrowed: getCompoundV2Tvl(
      comptroller, 
      "avax", 
      addr => `avax:${addr}`, 
      "0xC22F01ddc8010Ee05574028528614634684EC29e", 
      ADDRESSES.avax.WAVAX, 
      true
      ),
  }
};
