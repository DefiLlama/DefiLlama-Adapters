const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')

const LBTCV = '0x5401b8620E5FB570064CA9114fd1e135fd77D57c'            // vault (ETH/Base/BSC)
const SONIC_VAULT = '0x309f25d839a2fe225e80210e110C99150Db98AAF'      // vault (Sonic)

// Curve (Ethereum)
async function tvlCurve(_, _b, _cb, { api }) {
  const tokensAndOwners = [
    // https://www.curve.finance/dex/ethereum/pools/factory-stable-ng-251/deposit
    ['0x2f3bC4c27A4437AeCA13dE0e37cdf1028f3706F0', LBTCV],

    // https://www.curve.finance/dex/ethereum/pools/factory-stable-ng-269/deposit
    ['0xabaf76590478F2fE0b396996f55F0b61101e9502', LBTCV],

    // https://www.curve.finance/dex/ethereum/pools/factory-stable-ng-557/deposit
    ['0x8c5AE8C58Fd17D50Fc87349F5BCB6BDfE5929305', LBTCV],
  ]
  return sumTokens2({ api, tokensAndOwners, resolveLP: true })
}

// universal composer to avoid double counting
function composeChainTVL(baseScanner) {
  return async (...args) => {
    const [, , , { api }] = args
    // 1) base scanner (owners + resolveUniV3)
    if (baseScanner) await baseScanner(...args)
    // 2) add Curve positions
    await tvlCurve(...args)
    return api.getBalances()
  }
}

module.exports = {
  doublecounted: true,

  ethereum: {
    tvl: composeChainTVL(sumTokensExport({
      owners: [LBTCV], 
      fetchCoValentTokens: true,
      tokenConfig: { onlyWhitelisted: false },
      resolveUniV3: true,
    })),
  },

  base: {
    tvl: sumTokensExport({
      owners: [LBTCV],
      fetchCoValentTokens: true,
      tokenConfig: { onlyWhitelisted: false },
      resolveUniV3: true,
    }),
  },

  bsc: {
    tvl: sumTokensExport({
      owners: [LBTCV],
      fetchCoValentTokens: true,
      tokenConfig: { onlyWhitelisted: false },
      resolveUniV3: true,
    }),
  },

  sonic: {
    tvl: sumTokensExport({ owners: [SONIC_VAULT], tokens: [ADDRESSES.sonic.LBTC] }),
  },

  methodology:
    'TVL = assets in vaults + positions in DeFi protocols.',
}
