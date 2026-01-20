const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

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

// Aerodrome Slipstream (Base) - Concentrated Liquidity NFT positions
async function tvlAerodrome(_, _b, _cb, { api }) {
  const nftAddress = '0x827922686190790b37229fd06084350E74485b72'  
  await unwrapSlipstreamNFT({ api, owner: LBTCV, nftAddress })
  return {}
}

// Turtle Club Vault (Ethereum) - unwrap katanaLBTCv (BoringVault) to underlying assets
async function tvlTurtleClub(_, _b, _cb, { api }) {
  const katanaLBTCv = '0x75231079973c23e9eb6180fa3d2fc21334565ab5'  // Turtle Club BoringVault token
  
  // Get vault share balance held by LBTCV
  const shareBalance = await api.call({
    target: katanaLBTCv,
    abi: 'erc20:balanceOf',
    params: [LBTCV]
  })
  
  if (!shareBalance || shareBalance === '0') return {}
  
  // BoringVault architecture: Vault -> Hook -> Accountant -> (base asset + rate)
  const hook = await api.call({
    target: katanaLBTCv,
    abi: 'address:hook'
  })
  
  const accountant = await api.call({
    target: hook,
    abi: 'address:accountant'
  })
  
  const [baseAsset, rate, decimals] = await Promise.all([
    api.call({ target: accountant, abi: 'address:base' }),
    api.call({ target: accountant, abi: 'uint256:getRate' }),
    api.call({ target: accountant, abi: 'uint8:decimals' })
  ])
  
  // Calculate underlying amount: shareBalance * rate / 10^decimals
  const underlyingAmount = BigInt(shareBalance) * BigInt(rate) / BigInt(10 ** Number(decimals))
  
  api.add(baseAsset, underlyingAmount)
  
  return {}
}

// universal composer to avoid double counting
function composeChainTVL(baseScanner, additionalFns = []) {
  return async (...args) => {
    const [, , , { api }] = args
    // 1) base scanner (owners + resolveUniV3)
    if (baseScanner) await baseScanner(...args)
    // 2) add additional TVL functions (Curve, Aerodrome, etc)
    for (const fn of additionalFns) {
      await fn(...args)
    }
    return api.getBalances()
  }
}

module.exports = {
  doublecounted: true,

  ethereum: {
    tvl: composeChainTVL(
      sumTokensExport({
        owners: [LBTCV], 
        fetchCoValentTokens: true,
        tokenConfig: { 
          onlyWhitelisted: false,
          // Exclude Turtle Club vault token to avoid double counting (handled separately in tvlTurtleClub)
          blacklistedTokens: ['0x75231079973C23e9eB6180fa3D2fc21334565aB5']
        },
        resolveUniV3: true,
      }),
      [tvlCurve, tvlTurtleClub]
    ),
  },

  base: {
    tvl: composeChainTVL(
      sumTokensExport({
        owners: [LBTCV],
        fetchCoValentTokens: true,
        tokenConfig: { onlyWhitelisted: false },
        resolveUniV3: true,
      }),
      [tvlAerodrome]
    ),
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
          ADDRESSES.ethereum.BTCN, // BTCN on Corn
          ADDRESSES.corn.wBTCN, // wBTCN (Wrapped BTCN)
          ADDRESSES.etlk.LBTC, // LBTC on Corn
        ],
      }),
      [tvlCurveCorn]
    ),
  },

  sonic: {
    tvl: sumTokensExport({ owners: [SONIC_VAULT], tokens: [ADDRESSES.sonic.LBTC] }),
  },

  methodology:
    'TVL = assets in vaults + positions in DeFi protocols.',
}
