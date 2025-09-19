// DefiLlama SDK adapter — Morpheus (Capital V1 + V2 combined)
//
// Logic:
// • Before MIGRATION_TS: TVL = stETH balance on the legacy V1 contract
// • From MIGRATION_TS onwards: TVL = Distributor balances (V2):
//    - direct balances (stETH + any idle USDC/USDT/WETH/WBTC)
//    - aTokens held by Distributor (for AAVE strategies)

const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// ---------- Constants ----------

// V1 (legacy contract that held stETH)
const V1_STETH_HOLDER = '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790'

// V2
// Source of truth: https://gitbook.mor.org/smart-contracts/documentation/distribution-protocol/deployed-contracts
const DISTRIBUTOR = '0xDf1AC1AC255d91F5f4B1E3B4Aef57c5350F64C7A'

// Supported deposit tokens in Capital V2
const TOKENS = {
  STETH: ADDRESSES.ethereum.STETH, // strategy: NONE
  USDC:  ADDRESSES.ethereum.USDC,  // strategy: AAVE
  USDT:  ADDRESSES.ethereum.USDT,  // strategy: AAVE
  WETH:  ADDRESSES.ethereum.WETH,  // strategy: AAVE
  WBTC:  ADDRESSES.ethereum.WBTC,  // strategy: AAVE
}

// Migration timestamp: "stETH was moved from V1 to V2"
const MIGRATION_TS = 1758210107

// Minimal ABIs
const abi = {
  // Distributor -> Aave v3 data provider
  aavePoolDataProvider: 'function aavePoolDataProvider() view returns (address)',
  // Aave v3 data provider
  getReserveTokensAddresses:
    'function getReserveTokensAddresses(address asset) view returns (address aToken, address stableDebtToken, address variableDebtToken)',
}

async function tvl(timestamp, _ethBlock, _chainBlocks, { api }) {
  // Historical branch: before migration, only count V1 stETH
  if (timestamp && timestamp < MIGRATION_TS) {
    return sumTokens2({
      api,
      tokensAndOwners: [[TOKENS.STETH, V1_STETH_HOLDER]],
    })
  }

  // Active branch (>= MIGRATION_TS): count Distributor balances (V2)
  const tokensAndOwners = []

  // 1) Direct balances on Distributor
  //    (covers stETH with NONE strategy and any temporary idle balances of other tokens)
  const direct = [TOKENS.STETH, TOKENS.USDC, TOKENS.USDT, TOKENS.WETH, TOKENS.WBTC]
  direct.forEach(token => tokensAndOwners.push([token, DISTRIBUTOR]))

  // 2) AAVE positions: fetch aToken addresses for each underlying and count Distributor’s balances
  const dataProvider = await api.call({ abi: abi.aavePoolDataProvider, target: DISTRIBUTOR })
  const aaveUnderlyings = [TOKENS.USDC, TOKENS.USDT, TOKENS.WETH, TOKENS.WBTC]
  const reserves = await api.multiCall({
    abi: abi.getReserveTokensAddresses,
    calls: aaveUnderlyings.map(asset => ({ target: dataProvider, params: [asset] })),
  })
  reserves.forEach(([aToken]) => { if (aToken) tokensAndOwners.push([aToken, DISTRIBUTOR]) })

  // 3) Sum balances; DefiLlama will handle pricing and mapping aTokens to their underlyings
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    'TVL =\n' +
    ' • before migration: stETH balance on the V1 contract;\n' +
    ' • after migration: direct balances on the Distributor (stETH + idle USDC/USDT/WETH/WBTC) + aTokens held by Distributor for AAVE strategies.\n' +
    'In Capital V2, deposits are not stored in DepositPool — they are routed to the Distributor and then into strategies (e.g., Aave).',
  // Full project history starting from Fair Launch (V1)
  start: 1707350400, // 2024-02-08 00:00:00 UTC — start of TVL history (Fair Launch)
  hallmarks: [
    [1707350400, 'MOR token launch (Feb-08-2024)'],
    [1758107291, 'Capital V2 contracts deployed'],
    [1758210107, 'stETH migrated from V1 to V2'],
  ],
  ethereum: { tvl },
}
