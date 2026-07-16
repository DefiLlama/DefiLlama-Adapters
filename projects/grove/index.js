const ADDRESSES = require('../helper/coreAssets.json')

const almProxy = {
  ethereum: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
  base: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
  avax: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
  plume_mainnet: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
}

const tokenConfigs = {
  ethereum: [
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // JTRSY (Janus Henderson via Centrifuge)
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // BUIDL-I (BlackRock via Securitize)
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // JAAA (Janus Henderson via Centrifuge)
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // STAC (BNY Mellon via Securitize)
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // aEthRLUSD (Aave Core)
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // aHorRwaRLUSD (Aave Horizon)
    ADDRESSES.mantle.AUSD, // AUSD (Agora)
    ADDRESSES.ethereum.USDC,
  ],
  base: [
    ADDRESSES.base.USDC,
  ],
  avax: [
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // JAAA (Janus Henderson via Centrifuge on Avalanche)
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // GACLO-1 (Galaxy Arch CLO)
    ADDRESSES.avax.USDC,
  ],
  plume_mainnet: [
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // ACRDX (Apollo via Centrifuge on Plume)
  ],
}

const morphoVaultConfigs = {
  ethereum: [
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // grove-bbqUSDC-V2
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // grove-bbqAUSD-V2
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // grove-bbqUSDC
  ],
  base: [
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // grove-bbqUSDC
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // steakUSDC-V2
  ],
}

const curveConfigs = {
  ethereum: [
    {
      address: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // CURVE AUSD/USDC
      coinIndices: [0, 1],
    },
  ],
}

async function tvl(api) {
  const tokens = tokenConfigs[api.chain] || []
  const proxy = almProxy[api.chain]

  if (tokens.length > 0) {
    const balanceCalls = tokens.map((token) => ({ target: token, params: proxy }))
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls })
    api.add(tokens, balances)
  }

  // Remove up to $50M GALCO seeded by Grove from TVL
  if (api.chain === 'avax') {
    const GALCO = 'avax:0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
    const SEED_AMOUNT = 50_000_000e6
    const balances = api.getBalances()
    const galcoBal = Number(balances[GALCO] || 0)
    if (galcoBal > 0) {
      balances[GALCO] = String(Math.max(0, galcoBal - SEED_AMOUNT))
    }
  }
  
  await addMorphoVaultBalances(api)
  await addCurveBalances(api)
}

async function addMorphoVaultBalances(api) {
  const vaults = morphoVaultConfigs[api.chain]
  if (!vaults || vaults.length === 0) return

  const proxy = almProxy[api.chain]
  const shares = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: vaults.map((vault) => ({ target: vault, params: proxy })),
  })
  const assets = await api.multiCall({
    abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
    calls: vaults.map((vault, i) => ({ target: vault, params: shares[i] })),
  })
  const underlyings = await api.multiCall({
    abi: 'address:asset',
    calls: vaults,
  })

  api.add(underlyings, assets)
}

async function addCurveBalances(api) {
  const curvePools = curveConfigs[api.chain]
  if (!curvePools || curvePools.length === 0) return

  for (const curvePool of curvePools) {
    const [totalSupply, lpBalance] = await api.batchCall([
      { abi: 'erc20:totalSupply', target: curvePool.address },
      { abi: 'erc20:balanceOf', target: curvePool.address, params: almProxy[api.chain] },
    ])

    if (Number(lpBalance) === 0) continue
    const shares = lpBalance / totalSupply

    for (const coinIndex of curvePool.coinIndices) {
      const [coinBalance, coinAddress] = await api.batchCall([
        { abi: 'function balances(uint256) public view returns (uint256)', target: curvePool.address, params: coinIndex },
        { abi: 'function coins(uint256) public view returns (address)', target: curvePool.address, params: coinIndex },
      ])
      api.add(coinAddress, coinBalance * shares)
    }
  }
}

module.exports = {
  methodology: 'Counts the value of assets held by the Grove ALM Proxy across all chains, including RWA tokens, Aave aTokens, Morpho vault shares, Curve LP positions, and stablecoins. Excludes up to $50M of GALCO tokens from grove anchor allocation: https://investor.galaxy.com/news-releases/news-release-details/galaxy-announces-initial-closing-debut-tokenized-clo-75-million',
  start: '2025-06-25',
}

Object.keys(tokenConfigs).forEach((chain) => {
  module.exports[chain] = { tvl }
})
