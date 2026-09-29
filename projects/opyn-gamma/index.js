const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

// avax
const avaxMarginPool = "0xCCF6629aEaB734E621Cc59EBb0297196774fDb9D";
const wavax = ADDRESSES.avax.WAVAX.toLowerCase()
const avaxTvl = sumTokensExport({ owner: avaxMarginPool, tokens: [wavax] })

// polygon
const polygonMarginPool = "0x30ae5debc9edf60a23cd19494492b1ef37afa56d";
const WETH = ADDRESSES.polygon.WETH_1;
const polygonCollateralAssets = [ADDRESSES.polygon.WMATIC_2,
  ADDRESSES.polygon.USDC,
  ADDRESSES.polygon.WBTC, WETH,]
const polygonTvl = sumTokensExport({ owner: polygonMarginPool, tokens: polygonCollateralAssets })

// ethereum
const START_BLOCK = 11551118;
const whitelist = "0xa5ea18ac6865f315ff5dd9f1a7fb1d41a30a6779";
const ethMarginPool = "0x5934807cc0654d46755ebd2848840b616256c6ef";

function toAddress(str, skip = 0) {
  return `0x${str.slice(64 - 40 + 2 + skip * 64, 64 + 2 + skip * 64)}`.toLowerCase();
}

async function ethereumTvl(api) {
  let balances = {};

  if (!api.block || api.block >= START_BLOCK) {
    const whitelistedCollaterals = await getLogs({
      target: whitelist,
      topic: 'CollateralWhitelisted(address)',
      api,
      fromBlock: 11544457,
    })

    const tokens = whitelistedCollaterals.map(log => toAddress(log.topics[1]))
    return sumTokens2({ tokens, owner: ethMarginPool, api, })
  }

  return balances;
}


module.exports = {
  ethereum: {
    tvl: ethereumTvl
  },
  avax: {
    tvl: avaxTvl
  },
  polygon: {
    tvl: polygonTvl
  }
}
