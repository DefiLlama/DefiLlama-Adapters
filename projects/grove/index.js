const ADDRESSES = require('../helper/coreAssets.json')

const almProxy = {
  ethereum: '0x491EDFB0B8b608044e227225C715981a30F3A44E',
  base: '0x9B746dBC5269e1DF6e4193Bcb441C0FbBF1CeCEe',
  avax: '0x7107DD8F56642327945294a18A4280C78e153644',
  plume_mainnet: '0x1DB91ad50446a671e2231f77e00948E68876F812',
}

const tokenConfigs = {
  ethereum: [
    '0x8c213ee79581Ff4984583C6a801e5263418C4b86', // JTRSY (Janus Henderson via Centrifuge)
    '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041', // BUIDL-I (BlackRock via Securitize)
    '0x5a0f93d040de44e78f251b03c43be9cf317dcf64', // JAAA (Janus Henderson via Centrifuge)
    '0x51C2d74017390CbBd30550179A16A1c28F7210fc', // STAC (BNY Mellon via Securitize)
    '0xFa82580c16A31D0c1bC632A36F82e83EfEF3Eec0', // aEthRLUSD (Aave Core)
    '0xE3190143Eb552456F88464662f0c0C4aC67A77eB', // aHorRwaRLUSD (Aave Horizon)
    '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a', // AUSD (Agora)
    ADDRESSES.ethereum.USDC,
  ],
  base: [
    ADDRESSES.base.USDC,
  ],
  avax: [
    '0x58f93d6b1ef2f44ec379cb975657c132cbed3b6b', // JAAA (Janus Henderson via Centrifuge on Avalanche)
    '0x2C0aDFF8e114f3cA106051144353aC703D24B901', // GACLO-1 (Galaxy Arch CLO)
    ADDRESSES.avax.USDC,
  ],
  plume_mainnet: [
    '0x9477724Bb54AD5417de8Baff29e59DF3fB4DA74f', // ACRDX (Apollo via Centrifuge on Plume)
  ],
}

const morphoVaultConfigs = {
  ethereum: [
    '0xBeefF08dF54897e7544aB01d0e86f013DA354111', // grove-bbqUSDC-V2
    '0xBEEfF0d672ab7F5018dFB614c93981045D4aA98a', // grove-bbqAUSD-V2
    '0xBEEf2B5FD3D94469b7782aeBe6364E6e6FB1B709', // grove-bbqUSDC
  ],
  base: [
    '0xBeEf2d50B428675a1921bC6bBF4bfb9D8cF1461A', // grove-bbqUSDC
    '0xbeef0e0834849aCC03f0089F01f4F1Eeb06873C9', // steakUSDC-V2
  ],
}

const curveConfigs = {
  ethereum: [
    {
      address: '0xE79C1C7E24755574438A26D5e062Ad2626C04662', // CURVE AUSD/USDC
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
    const GALCO = 'avax:0x2C0aDFF8e114f3cA106051144353aC703D24B901'
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
