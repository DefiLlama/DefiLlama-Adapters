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

// Curve (Corn)
async function tvlCurveCorn(_, _b, _cb, { api }) {
  const curveLpToken = '0xAB3291b73a1087265E126E330cEDe0cFd4B8A693'
  
  // Get LP token balance held by vault
  const lpBalance = await api.call({
    target: curveLpToken,
    abi: 'erc20:balanceOf',
    params: [LBTCV]
  })
  
  if (!lpBalance || lpBalance === '0') return {}
  
  // Get total supply of LP token
  const totalSupply = await api.call({
    target: curveLpToken,
    abi: 'erc20:totalSupply'
  })
  
  // Get coins (underlying tokens)
  const [token0, token1] = await Promise.all([
    api.call({ target: curveLpToken, abi: 'function coins(uint256) view returns (address)', params: [0] }),
    api.call({ target: curveLpToken, abi: 'function coins(uint256) view returns (address)', params: [1] })
  ])
  
  // Get pool balances for each token
  const [balance0, balance1] = await Promise.all([
    api.call({ target: curveLpToken, abi: 'function balances(uint256) view returns (uint256)', params: [0] }),
    api.call({ target: curveLpToken, abi: 'function balances(uint256) view returns (uint256)', params: [1] })
  ])
  
  // Calculate vault's share: (lpBalance / totalSupply) * poolBalance
  const share = BigInt(lpBalance) * BigInt(1e18) / BigInt(totalSupply)
  const amount0 = BigInt(balance0) * share / BigInt(1e18)
  const amount1 = BigInt(balance1) * share / BigInt(1e18)
  
  // Add underlying tokens to balances
  api.add(token0, amount0)
  api.add(token1, amount1)
  
  return {}
}

// universal composer to avoid double counting
function composeChainTVL(baseScanner, curveFn = tvlCurve) {
  return async (...args) => {
    const [, , , { api }] = args
    // 1) base scanner (owners + resolveUniV3)
    if (baseScanner) await baseScanner(...args)
    // 2) add Curve positions
    if (curveFn) await curveFn(...args)
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

  corn: {
    tvl: composeChainTVL(
      sumTokensExport({
        owners: [LBTCV],
        tokens: [
          '0x386E7A3a0c0919c9d53c3b04FF67E73Ff9e45Fb6', // BTCN on Corn
          '0xda5dDd7270381A7C2717aD10D1c0ecB19e3CDFb2', // wBTCN (Wrapped BTCN)
          '0xecAc9C5F704e954931349Da37F60E39f515c11c1', // LBTC on Corn
        ],
      }),
      tvlCurveCorn
    ),
  },

  sonic: {
    tvl: sumTokensExport({ owners: [SONIC_VAULT], tokens: [ADDRESSES.sonic.LBTC] }),
  },

  methodology:
    'TVL = assets in vaults + positions in DeFi protocols.',
}
