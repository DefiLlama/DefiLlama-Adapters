const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const xCRX = "0x35AfE95662fdf442762a11E4eD5172C81fBceF7e";
const CRX = "0xb21Be1Caf592A5DC1e75e418704d1B6d50B0d083";
const factory = "0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0";

const tvl = getUniTVL({ factory, useDefaultCoreAssets: true, fetchBalances: true })

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  arbitrum: {
    tvl,
    staking: staking(
      {
        owner: xCRX,
        tokens: [CRX],
        chain: 'arbitrum',
        coreAssets: [ADDRESSES.arbitrum.USDC],
        lps: ['0xf7305D209BFeCF40Bd53ccBdbe5303B3153d0660']
      })
  },
};
