const { staking } = require('../helper/staking')

const EUSD = '0x8B84D644CECaeE6d21373F37E1bA00f85eD7CdB7'
const MONEY = '0x0a8B4763C71aC39101b3B8a97e62Da0B81549a4f'
const SMONEY = '0xB6B87Ff4BA072851d1E7E69D39eEb7341b3A5F11'
const PSM = '0xA24A434b7Dae50E24e92B19E0907F8878458CCad'

// EUSDManager instances, one per collateral risk group, and the collateral each one accepts
const CDP_MANAGERS = {
  '0xF9c9a09ef44B9003f4E9CD76C30431389848cbF5': [ // index and gold
    '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
    '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68', // QQQ
    '0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e', // GLD
  ],
  '0xbd0A8dea2964C61dBC225dB3C1b4cE341A0c32C2': [ // ETH
    '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
  ],
  '0x6d491928BBEc0c508A939b103753A3472b63Cc8C': [ // big tech
    '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
    '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', // META
    '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', // GOOGL
    '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
    '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
    '0x12f190a9F9d7D37a250758b26824B97CE941bF54', // AMZN
  ],
  '0x948df8d22c8025f587697D02b4888fE432758d0e': [ // high volatility
    '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa', // SPCX
    '0xec262a75e413fAfD0dF80480274532C79D42da09', // MSTR
    '0xdF0992E440dD0be65BD8439b609d6D4366bf1CB5', // CRCL
    '0xfF080c8ce2E5feadaCa0Da81314Ae59D232d4afD', // MU
    '0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A', // PLTR
  ],
}

// EUSDLiquidityManager instances: each position is a per-user vault holding an asset/eUSD LP range
const LIQUIDITY_MANAGERS = [
  '0x64bf85F7F55C9c66e42ac70D970e01b9cd163554', // USDG/eUSD
  '0x62f482452340E5a4beB2bC910248DFfcF8f59C4b', // SPY/eUSD
]

const POSITION_ABI = 'function getPosition(uint256 poolId, address owner) view returns (tuple(address vault, bool staked, uint256 debt, uint256 feeIndexSnapshot, uint256 feesAccrued))'
const HOLDINGS_ABI = 'function holdings(uint256 price) view returns (uint256 assetAmount, uint256 eusdAmount)'

async function cdpCollateral(api) {
  const tokensAndOwners = Object.entries(CDP_MANAGERS).flatMap(([manager, tokens]) => tokens.map((t) => [t, manager]))
  await api.sumTokens({ tokensAndOwners })
}

async function psmReserves(api) {
  const count = await api.call({ target: PSM, abi: 'uint256:assetCount' })
  const assets = await api.multiCall({ target: PSM, abi: 'function assetAt(uint256) view returns (address)', calls: [...Array(Number(count)).keys()] })
  await api.sumTokens({ owner: PSM, tokens: assets })
}

async function lpCollateral(api) {
  const poolCounts = await api.multiCall({ calls: LIQUIDITY_MANAGERS, abi: 'uint256:poolCount' })
  const pools = LIQUIDITY_MANAGERS.flatMap((manager, i) => [...Array(Number(poolCounts[i])).keys()].map((poolId) => ({ manager, poolId })))
  const positionCounts = await api.multiCall({ abi: 'function positionCount(uint256) view returns (uint256)', calls: pools.map(({ manager, poolId }) => ({ target: manager, params: [poolId] })) })
  const slots = pools.flatMap((pool, i) => [...Array(Number(positionCounts[i])).keys()].map((index) => ({ ...pool, index })))
  const owners = await api.multiCall({ abi: 'function positionOwnerAt(uint256 poolId, uint256 index) view returns (address)', calls: slots.map(({ manager, poolId, index }) => ({ target: manager, params: [poolId, index] })) })
  const positions = await api.multiCall({ abi: POSITION_ABI, calls: slots.map(({ manager, poolId }, i) => ({ target: manager, params: [poolId, owners[i]] })) })
  const vaults = positions.map((p) => p.vault)
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const prices = await api.multiCall({ abi: 'uint256:poolPrice', calls: vaults })
  // only the asset side counts: the eUSD side is minted by the manager against this collateral
  const holdings = await api.multiCall({ abi: HOLDINGS_ABI, calls: vaults.map((target, i) => ({ target, params: [prices[i]] })) })
  holdings.forEach((h, i) => api.add(assets[i], h.assetAmount))
}

async function tvl(api) {
  await cdpCollateral(api)
  await psmReserves(api)
  await lpCollateral(api)
  api.removeTokenBalance(EUSD)
}

module.exports = {
  methodology: 'TVL is the collateral backing eUSD: stock tokens and WETH locked in the EUSDManager CDPs, the non-eUSD side (USDG, SPY) of the LP positions in EUSDLiquidityManager vaults, and the stablecoins in the eUSD PSM. eUSD itself is excluded. Staking is $MONEY staked in the sMONEY vault.',
  robinhood: {
    tvl,
    staking: staking(SMONEY, MONEY),
  },
}
