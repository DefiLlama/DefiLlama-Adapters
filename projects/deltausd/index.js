const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// DeltaUSD strategy/reserve wallet (receives USDT from the dUSD owner on BSC)
const owner = '0x12edd10a11fd9c94f9ac1b085a627f3745730899'
// Additional X Layer Aave account identified by the operator as dUSD backing
const xlayerAaveOwner = '0xacc5b404eb5b31728e225040830162a9482a81f9'
const dUSD = '0x1851302297e318d658829fd94b89d5ae6528cb9e' // dUSD token, also the mint/redeem contract
const operator = '0x929c98a6e23721f379b5e27cc694744a2b6d46c2' // dUSD owner

// Aave V3-style pool data providers, one per chain where the wallet has positions
const aaveDataProviders = {
  base: '0x0f43731eb8d45a581f4a36dd74f5f358bc90c73a',
  xlayer: '0x6c505c31714f14e8af2a03633eb2cdfb4959138f',
  plasma: '0xf2D6E38B407e31E7E7e4a16E6769728b76c7419F',
}

const MORPHO = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'
const morphoMarket = '0x2ea32f6f734f87db12a3b72cfe2b7381837f115411eb57171f672e2d03ed7cf7' // SOL loan / JitoSOL collateral

const aeroPool = '0xf634058dc94e6bf8e828e27621320c423bc8b18e'
const aeroGauge = '0xd424ba8ca9d4e278753de76651a0095451e65cd1'
const avnt = '0x696f9436b67233384889472cd7cd58a6fb5df4f1'

const dolomite = '0x003ca23fd5f0ca87d01f6ec6cd14a8ae60c2b97d'
const dolomiteAccounts = ['0', '53264408180604475640276221492191081784140241066643000915729132825556750807079']
const kodiakIsland = '0xe5a2ab5d2fb268e5ff43a5564e44c3309609aff9'
const kodiakFarm = '0x75da1d58a8d97f7b626224e7e71fa44db13689f2'
const kodiakNft = '0xfe5e8c83ffe4d9627a75eaa7fee864768db989bd'
const sWBERA = '0x118d2ceee9785eaf70c15cd74cd84c9f8c3eec9a'

// Supplied minus borrowed, per reserve; returns the reserve list so wallet balances of those tokens are counted too
async function addAave(api, account = owner) {
  const dataProvider = aaveDataProviders[api.chain]
  const reserves = await api.call({ target: dataProvider, abi: 'function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])' })
  const tokens = reserves.map(r => r.tokenAddress)
  const positions = await api.multiCall({
    target: dataProvider,
    abi: 'function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)',
    calls: tokens.map(t => ({ params: [t, account] })),
  })
  positions.forEach((p, i) => api.add(tokens[i], BigInt(p.currentATokenBalance) - BigInt(p.currentStableDebt) - BigInt(p.currentVariableDebt)))
  return tokens
}

async function bsc(api) {
  return sumTokens2({ api, owners: [dUSD, operator, owner], tokens: [ADDRESSES.bsc.USDT, ADDRESSES.null] })
}

async function base(api) {
  const aaveTokens = await addAave(api)

  // Morpho Blue: collateral minus debt (shares converted at the market's last accrual)
  const params = await api.call({ target: MORPHO, abi: 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)', params: morphoMarket })
  const market = await api.call({ target: MORPHO, abi: 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)', params: morphoMarket })
  const position = await api.call({ target: MORPHO, abi: 'function position(bytes32,address) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)', params: [morphoMarket, owner] })
  api.add(params.collateralToken, position.collateral)
  if (BigInt(market.totalBorrowShares) > 0n)
    api.add(params.loanToken, -(BigInt(position.borrowShares) * BigInt(market.totalBorrowAssets) / BigInt(market.totalBorrowShares)))

  // Aerodrome LP staked in its gauge, unwrapped below
  api.add(aeroPool, await api.call({ target: aeroGauge, abi: 'erc20:balanceOf', params: owner }))

  return sumTokens2({ api, owner, tokens: [...aaveTokens, params.loanToken, params.collateralToken, ADDRESSES.base.WETH, avnt, ADDRESSES.null], resolveLP: true })
}

async function xlayer(api) {
  const tokens = await addAave(api)
  await addAave(api, xlayerAaveOwner)
  return sumTokens2({ api, owner, tokens: [...tokens, ADDRESSES.null] })
}

async function plasma(api) {
  const tokens = await addAave(api)
  return sumTokens2({ api, owner, tokens: [...tokens, ADDRESSES.null] })
}

async function berachain(api) {
  const accounts = await api.multiCall({
    target: dolomite,
    abi: 'function getAccountBalances((address owner, uint256 number) account) view returns (uint256[], address[], (bool sign, uint128 value)[], (bool sign, uint256 value)[])',
    calls: dolomiteAccounts.map(number => ({ params: [[owner, number]] })),
  })
  const tokens = new Set([ADDRESSES.berachain.WBERA, sWBERA, kodiakIsland, ADDRESSES.null])
  for (const [, accountTokens, , values] of accounts)
    accountTokens.forEach((token, i) => {
      api.add(token, values[i].sign ? values[i].value : -BigInt(values[i].value))
      tokens.add(token)
    })

  // Kodiak island shares staked in its farm (island token is priced by coins)
  api.add(kodiakIsland, await api.call({ target: kodiakFarm, abi: 'erc20:balanceOf', params: owner }))

  return sumTokens2({ api, owner, tokens: [...tokens], uniV3nftsAndOwners: [[kodiakNft, owner]] })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'Counts configured on-chain DeltaUSD backing: BSC USDT at the dUSD mint/redeem contract, configured operator staging address and reserve wallet, wallet balances of tracked assets, proportional AMM deposits, owner-held Kodiak V3 NFT liquidity, deposits across the configured Aave Base, XLayer and Plasma pools, and the configured Base Morpho SOL/JitoSOL market. Includes Aave deposits and debt of the additional XLayer account 0xacc5b404eb5b31728e225040830162a9482a81f9, identified by the operator as dUSD backing. Subtracts Dolomite borrowing, all stable/variable debt across the configured lending pools, and Morpho debt. Excludes the Solana network, issued dUSD, Binance balances and futures, GoMining NFTs, unclaimed rewards/fees, and unconfigured positions including WETH/FAI and WETH/AVNT LPs. Assets deployed into other protocols overlap their TVL. This is a partial on-chain backing measure, not total reserves or a solvency attestation.',
  bsc: { tvl: bsc },
  base: { tvl: base },
  xlayer: { tvl: xlayer },
  plasma: { tvl: plasma },
  berachain: { tvl: berachain },
}
