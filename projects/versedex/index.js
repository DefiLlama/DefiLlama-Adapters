const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

const FLEXUSD = ADDRESSES.smartbch.flexUSD;
const WBCH = ADDRESSES.smartbch.WBCH;
const SBCH_FACTORY = "0x16bc2B187D7C7255b647830C05a6283f2B9A3AF8";

const DAI = ADDRESSES.ethereum.DAI;
const WETH = ADDRESSES.ethereum.WETH;
const ETH_FACTORY = "0xee3E9E46E34a27dC755a63e2849C9913Ee1A06E2";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x16bc2B187D7C7255b647830C05a6283f2B9A3AF8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereum: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: ETH_FACTORY}),
  },
  smartbch: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: SBCH_FACTORY})
  },
}
