const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { uniTvlExport } = require('../helper/unknownTokens.js')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x5De74546d3B86C8Df7FEEc30253865e1149818C8';
const stablePool = "0x01C9475dBD36e46d1961572C8DE24b74616Bae9e"
const stablePoolTokens = [ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC, ADDRESSES.polygon.DAI]

async function tvl(api) {
  return sumTokens2({ api, owner: stablePool, tokens: stablePoolTokens, })
}

const uniTvl = uniTvlExport('chain', FACTORY).chain.tvl

module.exports = {
  methodology: "Includes liquidity on all the pools on the uniswap fork plus the liquidity in the 3FBird stableswap pool",
  misrepresentedTokens: true,
  polygon: { tvl: sdk.util.sumChainTvls([tvl, uniTvl]) },
};