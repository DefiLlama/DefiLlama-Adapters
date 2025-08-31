const sdk = require('@defillama/sdk');

// get these vaults only for Compound Blue
const vaults = [
  '0x781FB7F6d845E3bE129289833b04d43Aa8558c42',
  '0xF5C81d25ee174d83f1FD202cA94AE6070d073cCF',
  '0xfD06859A671C21497a2EB8C5E3fEA48De924D6c8',
  '0x3F33F9f7e2D7cfBCBDf8ea8b870a6E3d449664c2',
]

// get these markets only for Compound Blue
const markets = [
  '0xa5b7ae7654d5041c28cb621ee93397394c7aee6c6e16c7e0fd030128d87ee1a3',
  '0x1cfe584af3db05c7f39d60e458a87a8b2f6b5d8c6125631984ec489f1d13553b',
  '0x01550b8779f4ca978fc16591537f3852c02c3491f597db93d9bb299dcbf5ddbe',
  '0x2476bb905e3d94acd7b402b3d70d411eeb6ace82afd3007da69a0d5904dfc998',
  '0xb8ae474af3b91c8143303723618b31683b52e9c86566aa54c06f0bc27906bcae',
  '0x1947267c49c3629c5ed59c88c411e8cf28c4d2afdb5da046dc8e3846a4761794',
  '0x7506b33817b57f686e37b87b5d4c5c93fdef4cffd21bbf9291f18b2f29ab0550',
  '0x41e537c46cc0e2f82aa69107cd72573f585602d8c33c9b440e08eaba5e8fded1',
  '0xa932e0d8a9bf52d45b8feac2584c7738c12cf63ba6dff0e8f199e289fb5ca9bb',
  '0xd1485762dd5256b99530b6b07ab9d20c8d31b605dd5f27ad0c6dec2a18179ac6',
  '0xa8c2e5b31d1f3fb6c000bd49355d091f71e7c866fcb74a1cb2562ef67157bc2a',
  '0x267f344f5af0d85e95f253a2f250985a9fb9fca34a3342299e20c83b6906fc80',
  '0x9eacb622c6ef9c2f0fa5f1fda58a8702eb8132d8f49783f6eea6acc3a398e741',
  '0x8513df298cab92cafba1bae394420b7150aa40a5fac649c7168404bd5174a54c',
]

const morphoBlue = '0x1bF0c2541F820E775182832f06c0B7Fc27A25f67'
const morphoBlueAbis = {
  market: 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
  idToMarketParams: 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
}

async function getBorrowed(api) {
  const balances = {}

  const idToMarketParams = await api.multiCall({ abi: morphoBlueAbis.idToMarketParams, calls: markets.map(marketId=> {
    return {
      target: morphoBlue,
      params: [marketId],
    }
  }) })
  const marketData = await api.multiCall({ abi: morphoBlueAbis.market, calls: markets.map(marketId=> {
    return {
      target: morphoBlue,
      params: [marketId],
    }
  }) })

  const loanTokens = idToMarketParams.map(params => params.loanToken)
  for (let i = 0; i < loanTokens.length; i++) {
    const token = String(loanTokens[i]).toLowerCase()
    if (!balances[token]) {
      balances[token] = BigInt(0)
    }
    balances[token] += BigInt(marketData[i].totalBorrowAssets)
  }

  return balances
}

async function tvl(api) {
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })   
  
  const balances = {}
  for (let i = 0; i < assets.length; i++) {
    const token = String(assets[i]).toLowerCase()
    if (!balances[token]) {
      balances[token] = BigInt(0)
    }
    balances[token] += BigInt(totalAssets[i])
  }

  const totalBorrowed = await getBorrowed(api)

  for (const [token, balance] of Object.entries(balances)) {
    const tvl = balance - totalBorrowed[token]
    api.add(token, tvl)
  }
}

async function borrowed(api) {
  const totalBorrowed = await getBorrowed(api)
  api.add(Object.keys(totalBorrowed), Object.values(totalBorrowed))
}

module.exports = {
  // because all assets are deposited into Morpho Blue
  doublecounted: true,
  methodology: 'Count total assets are deposited in Morpho Blue vaults.',
  start: 1741219200, // 2025-03-06
  polygon: {
    tvl,
    borrowed,
  },
};
