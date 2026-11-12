const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

const owner = '0x12edd10a11fd9c94f9ac1b085a627f3745730899'
// The dUSD token itself implements mint/redeem and receives USDT deposits.
const mint = '0x1851302297e318d658829fd94b89d5ae6528cb9e'
// Configured operator address used to stage USDT before strategy allocation.
const operator = '0x929c98a6e23721f379b5e27cc694744a2b6d46c2'
const quickswap = '0x59153f27eefe07e5ece4f9304ebba1da6f53ca88'
const beefy = '0x7a027b2d77db12ff54c274f21497094c21824d6f'
const aeroPool = '0xf634058dc94e6bf8e828e27621320c423bc8b18e'
const aeroGauge = '0xd424ba8ca9d4e278753de76651a0095451e65cd1'
const aToken = '0x5d72a9d9a9510cd8cbdba12ac62593a58930a948'
const island = '0xe5a2ab5d2fb268e5ff43a5564e44c3309609aff9'
const islandFarm = '0x75da1d58a8d97f7b626224e7e71fa44db13689f2'
const dolomite = '0x003ca23fd5f0ca87d01f6ec6cd14a8ae60c2b97d'
const kodiakNft = '0xfe5e8c83ffe4d9627a75eaa7fee864768db989bd'
// Discovered in LogDeposit/LogWithdraw for this owner; keep as a uint256 string.
const dolomiteAccounts = ['0', '53264408180604475640276221492191081784140241066643000915729132825556750807079']
const avnt = '0x696f9436b67233384889472cd7cd58a6fb5df4f1'
// Aave DAO address book: AaveV3XLayer.sol, AaveV3Base.sol and AaveV3BNB.sol.
const xlayerPool = '0xe3f3caefdd7180f884c01e57f65df979af84f116'
const xlayerDataProvider = '0x6c505c31714f14e8af2a03633eb2cdfb4959138f'
const basePool = '0xa238dd80c259a72e81d7e4664a9801593f98d1c5'
const baseDataProvider = '0x0f43731eb8d45a581f4a36dd74f5f358bc90c73a'
const bscPool = '0x6807dc923806fe8fd134338eabca509979a7e0cb'
const bscDataProvider = '0xc90df74a7c16245c5f5c5870327ceb38fe5d5328'
const xlendReceipt = '0xea299346c31a13f85ccf70ca337d83e93ea6bdf3' // Extra Finance Xlend exOptUSDT
// Extra Finance Xlend Base: pool read from the exBaseUSDS receipt token.
const baseXlendPool = '0x09b11746dfd1b5a8325e30943f8b3d5000922e03'
const baseXlendDataProvider = '0x1566da4640b6a0b32ff309b07b8df6ade40fd98d'
const morpho = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'
// SOL loan / JitoSOL collateral market, discovered for the reserve owner.
const morphoMarkets = ['0x2ea32f6f734f87db12a3b72cfe2b7381837f115411eb57171f672e2d03ed7cf7']

const abi = {
  reserves: 'function getReserves() view returns (uint256 reserve0, uint256 reserve1, uint256 timestamp)',
  clmTokens: 'function wants() view returns (address token0, address token1)',
  clmBalances: 'function balances() view returns (uint256 balance0, uint256 balance1)',
  islandBalances: 'function getUnderlyingBalances() view returns (uint256 amount0, uint256 amount1)',
  dolomiteBalances: 'function getAccountBalances((address owner, uint256 number) account) view returns (uint256[], address[], (bool sign, uint128 value)[], (bool sign, uint256 value)[])',
  reserveTokens: 'function getReserveTokensAddresses(address) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)',
  morphoParams: 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  morphoPosition: 'function position(bytes32,address) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
  morphoMarket: 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
  morphoRate: 'function borrowRateView((address loanToken,address collateralToken,address oracle,address irm,uint256 lltv),(uint128 totalSupplyAssets,uint128 totalSupplyShares,uint128 totalBorrowAssets,uint128 totalBorrowShares,uint128 lastUpdate,uint128 fee)) view returns (uint256)',
}

const balanceOf = (api, target, account = owner) => api.call({ target, abi: 'erc20:balanceOf', params: account })
const read = (api, target, name) => api.call({ target, abi: name })
const same = (a, b) => a.toLowerCase() === b.toLowerCase()

function proportional(amount, shares, supply) {
  amount = BigInt(amount); shares = BigInt(shares); supply = BigInt(supply)
  if (supply === 0n) {
    if (shares !== 0n) throw new Error('Nonzero position in a zero-supply contract')
    return '0'
  }
  if (shares > supply) throw new Error('Position exceeds total supply')
  return (amount * shares / supply).toString()
}

async function tokensOf(api, pool) {
  return Promise.all([read(api, pool, 'address:token0'), read(api, pool, 'address:token1')])
}

// The owner's shares only; never count the pool's entire reserves.
async function addPair(api, pool, gauge) {
  const [tokens, reserves, supply, walletShares] = await Promise.all([
    tokensOf(api, pool), read(api, pool, abi.reserves), read(api, pool, 'erc20:totalSupply'), balanceOf(api, pool),
  ])
  let shares = BigInt(walletShares)
  if (gauge) {
    const stakingToken = await read(api, gauge, 'address:stakingToken')
    if (!same(stakingToken, pool)) throw new Error('Gauge does not stake the configured pool')
    shares += BigInt(await balanceOf(api, gauge))
  }
  tokens.forEach((token, i) => api.add(token, proportional(reserves[i], shares, supply)))
  return tokens
}

async function bsc(api) {
  const tokens = await addAavePool(api, bscPool, bscDataProvider)
  await sumTokens2({ api, tokens: [...new Set([...tokens, ADDRESSES.bsc.USDT].map(t => t.toLowerCase()))], owner })
  await sumTokens2({ api, tokens: [ADDRESSES.bsc.USDT], owners: [mint, operator] })
}

async function polygon(api) {
  const tokens = await addPair(api, quickswap)
  await sumTokens2({ api, tokens, owner })
}

async function base(api) {
  await api.getBlock()
  const aeroTokens = await addPair(api, aeroPool, aeroGauge)
  const clm = await read(api, beefy, 'address:want')
  const [shares, vaultSupply, vaultAssets, looseClmShares, clmSupply, clmTokens, clmBalances] = await Promise.all([
    balanceOf(api, beefy), read(api, beefy, 'erc20:totalSupply'), read(api, beefy, 'uint256:balance'),
    balanceOf(api, clm), read(api, clm, 'erc20:totalSupply'), read(api, clm, abi.clmTokens), read(api, clm, abi.clmBalances),
  ])
  // Beefy vault -> CLM shares -> underlying SOL and JitoSOL. Loose CLM shares are separate assets.
  const clmShares = BigInt(proportional(vaultAssets, shares, vaultSupply)) + BigInt(looseClmShares)
  for (let i = 0; i < 2; i++) api.add(clmTokens[i], proportional(clmBalances[i], clmShares, clmSupply))
  const aaveTokens = await addAavePool(api, basePool, baseDataProvider)
  const xlendTokens = await addAavePool(api, baseXlendPool, baseXlendDataProvider)
  const morphoTokens = (await Promise.all(morphoMarkets.map(id => addMorphoMarket(api, id)))).flat()
  await sumTokens2({ api, tokens: [...new Set([...aeroTokens, ...clmTokens, ...aaveTokens, ...xlendTokens, ...morphoTokens, ADDRESSES.base.WETH, avnt].map(t => t.toLowerCase()))], owner })
  await api.sumTokens({ owner, tokens: [ADDRESSES.null] })
}

async function addMorphoMarket(api, id) {
  const [params, position, market, block] = await Promise.all([
    api.call({ target: morpho, abi: abi.morphoParams, params: id }),
    api.call({ target: morpho, abi: abi.morphoPosition, params: [id, owner] }),
    api.call({ target: morpho, abi: abi.morphoMarket, params: id }),
    api.provider.getBlock(await api.getBlock()),
  ])
  const tokens = [params.loanToken, params.collateralToken]
  if (same(tokens[0], ADDRESSES.null) || same(tokens[1], ADDRESSES.null)) throw new Error('Unknown Morpho market')
  if (position.every(value => BigInt(value) === 0n)) return tokens
  const wad = 10n ** 18n, virtualShares = 1000000n
  let [supplyAssets, supplyShares, borrowAssets, borrowShares, lastUpdate, fee] = market.map(BigInt)
  let ownerSupplyShares = BigInt(position.supplyShares)
  const elapsed = BigInt(block.timestamp) - lastUpdate
  if (elapsed < 0n) throw new Error('Morpho market updated after the requested block')
  // MorphoBalancesLib / MathLib: accrue interest at this block using integer arithmetic.
  if (elapsed > 0n && borrowAssets > 0n && !same(params.irm, ADDRESSES.null)) {
    const rate = BigInt(await api.call({ target: params.irm, abi: abi.morphoRate, params: [Array.from(params), Array.from(market)] }))
    const first = rate * elapsed
    const second = first * first / (2n * wad)
    const third = second * first / (3n * wad)
    const interest = borrowAssets * (first + second + third) / wad
    supplyAssets += interest
    borrowAssets += interest
    if (fee > 0n) {
      const feeAssets = interest * fee / wad
      const feeShares = feeAssets * (supplyShares + virtualShares) / (supplyAssets - feeAssets + 1n)
      supplyShares += feeShares
      if (feeShares > 0n && same(await read(api, morpho, 'address:feeRecipient'), owner)) ownerSupplyShares += feeShares
    }
  }
  const supplied = ownerSupplyShares * (supplyAssets + 1n) / (supplyShares + virtualShares)
  // SharesMathLib.toAssetsUp: round debt up rather than overstate backing.
  const denominator = borrowShares + virtualShares
  const borrowed = (BigInt(position.borrowShares) * (borrowAssets + 1n) + denominator - 1n) / denominator
  api.add(params.loanToken, (supplied - borrowed).toString())
  api.add(params.collateralToken, position.collateral)
  return tokens
}

async function plasma(api) {
  const underlying = await read(api, aToken, 'address:UNDERLYING_ASSET_ADDRESS')
  const pool = await read(api, aToken, 'address:POOL')
  const reserve = await api.call({ target: pool,
    abi: 'function getReserveData(address) view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt)',
    params: underlying,
  })
  if (!same(reserve.aTokenAddress, aToken)) throw new Error('Unexpected Aave aToken')
  const [supply, debt] = await Promise.all([balanceOf(api, aToken), balanceOf(api, reserve.variableDebtTokenAddress)])
  // Aave balanceOf includes accrued supply/borrow interest; subtract same-reserve variable debt.
  api.add(underlying, (BigInt(supply) - BigInt(debt)).toString())
  await sumTokens2({ api, tokens: [underlying], owner })
}

async function addAavePool(api, pool, dataProvider) {
  // Discover every reserve from the configured Aave pool, not a hardcoded list of current collateral.
  const tokens = await read(api, pool, 'address[]:getReservesList')
  const reserves = await api.multiCall({ target: dataProvider, abi: abi.reserveTokens, calls: tokens })
  const [supplies, debts] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: reserves.map(r => ({ target: r.aTokenAddress, params: owner })) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: reserves.map(r => ({ target: r.variableDebtTokenAddress, params: owner })) }),
  ])
  const stableIndices = reserves.map((r, i) => same(r.stableDebtTokenAddress, ADDRESSES.null) ? -1 : i).filter(i => i >= 0)
  const stableDebts = stableIndices.length ? await api.multiCall({ abi: 'erc20:balanceOf',
    calls: stableIndices.map(i => ({ target: reserves[i].stableDebtTokenAddress, params: owner })),
  }) : []
  const stableByIndex = Object.fromEntries(stableIndices.map((i, j) => [i, stableDebts[j]]))
  tokens.forEach((token, i) => api.add(token, (BigInt(supplies[i]) - BigInt(debts[i]) - BigInt(stableByIndex[i] ?? 0)).toString()))
  return tokens
}

async function xlayer(api) {
  const tokens = await addAavePool(api, xlayerPool, xlayerDataProvider)
  await sumTokens2({ api, tokens, owner })
  await api.sumTokens({ owner, tokens: [ADDRESSES.null] })
}

async function optimism(api) {
  // Xlend uses Aave V3-compatible accrued aToken/debt balances.
  const pool = await read(api, xlendReceipt, 'address:POOL')
  const provider = await read(api, pool, 'address:ADDRESSES_PROVIDER')
  const dataProvider = await read(api, provider, 'address:getPoolDataProvider')
  const tokens = await addAavePool(api, pool, dataProvider)
  await sumTokens2({ api, tokens, owner })
  await api.sumTokens({ owner, tokens: [ADDRESSES.null] })
}

async function berachain(api) {
  const rows = await api.multiCall({ target: dolomite, abi: abi.dolomiteBalances,
    calls: dolomiteAccounts.map(number => ({ params: [[owner, number]] })),
  })
  const freeTokens = new Set()
  for (const row of rows) {
    const tokens = row[1], values = row[3]
    tokens.forEach((token, i) => {
      const value = BigInt(values[i].value)
      api.add(token, (values[i].sign ? value : -value).toString())
      freeTokens.add(token.toLowerCase())
    })
  }
  const stakeToken = await read(api, islandFarm, 'address:stakeToken')
  if (!same(stakeToken, island)) throw new Error('Unexpected Kodiak farm stake token')
  const [tokens, amounts, supply, walletShares, farmShares] = await Promise.all([
    tokensOf(api, island), read(api, island, abi.islandBalances), read(api, island, 'erc20:totalSupply'),
    balanceOf(api, island), balanceOf(api, islandFarm),
  ])
  const shares = BigInt(walletShares) + BigInt(farmShares)
  tokens.forEach((token, i) => {
    api.add(token, proportional(amounts[i], shares, supply))
    freeTokens.add(token.toLowerCase())
  })
  // Enumerate this owner's Kodiak V3 NFTs, so a sold NFT is not counted forever.
  await unwrapUniswapV3NFT({ api, balances: api.getBalances(), owner, nftAddress: kodiakNft })
  freeTokens.add('0x118d2ceee9785eaf70c15cd74cd84c9f8c3eec9a') // sWBERA
  freeTokens.add(ADDRESSES.berachain.WBERA.toLowerCase())
  await sumTokens2({ api, tokens: [...freeTokens], owner })
  await api.sumTokens({ owner, tokens: [ADDRESSES.null] })
}

module.exports = {
  timetravel: false, // Curated current portfolio; not a reconstruction of historical allocations.
  // Assets overlap with Aave, Morpho, Extra Finance Xlend, Beefy, Aerodrome, QuickSwap, Dolomite and Kodiak.
  doublecounted: true,
  methodology: 'Counts configured on-chain DeltaUSD backing: BSC USDT at the dUSD mint/redeem contract, configured operator staging address and reserve wallet, wallet balances of tracked assets, proportional AMM/vault deposits, owner-held Kodiak V3 NFT liquidity, deposits across the configured Aave BSC, Base and XLayer pools and Extra Finance Xlend Base and Optimism pools, and the configured Base Morpho SOL/JitoSOL market. Subtracts Dolomite borrowing, same-reserve Aave variable debt in Plasma, all stable/variable debt across the configured lending pools, and Morpho debt including interest accrued to the measured block. Morpho supply and borrowing use the protocol virtual-share accounting and conservative rounding. Excludes the Solana network, issued dUSD, Binance balances and futures, GoMining NFTs, unclaimed rewards/fees, and unconfigured positions including WETH/FAI and WETH/AVNT LPs. Assets deployed into other protocols overlap their TVL. This is a partial on-chain backing measure, not total reserves or a solvency attestation.',
  bsc: { tvl: bsc },
  polygon: { tvl: polygon },
  base: { tvl: base },
  plasma: { tvl: plasma },
  berachain: { tvl: berachain },
  xlayer: { tvl: xlayer },
  optimism: { tvl: optimism },
}
