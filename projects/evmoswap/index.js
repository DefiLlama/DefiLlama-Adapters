const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens')

const madDAI = ADDRESSES.evmos.DAI
const madUSDC = ADDRESSES.evmos.USDC
const madUSDT = ADDRESSES.evmos.USDT

//////////////////////////// UNI AMM ////////////////////////////////////
const evmoswapTvl = getUniTVL({ factory: '0xF24E36e53628C3086493B9EfA785ab9DD85232EB', useDefaultCoreAssets: true })

//////////////////////////// STABLE AMM ////////////////////////////////////
const poolAddressesEvmos = [
  "0xf0a5b0fa1531C94754241911A2E6D94506336321", // 3pool
];

async function stableAMMTvl(api) {
  return api.sumTokens({owners: poolAddressesEvmos, tokens: [madDAI, madUSDC, madUSDT]})
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xF24E36e53628C3086493B9EfA785ab9DD85232EB) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  evmos: {
    tvl: sdk.util.sumChainTvls([evmoswapTvl, stableAMMTvl]),
  },
}
