const { getTokenMintFromMarketIndex, processSpotPosition, processPerpPosition, getPerpTokenMintFromMarketIndex, getVaultPublicKey } = require("./spotMarkets");
const { deserializeUserPositions, fetchVaultUserAddressesWithOffset, fetchVaultAddresses} = require("./helpers");
const { getPerpMarketFundingRates } = require("./spotMarkets");
const { getMultipleAccounts} = require('../helper/solana')



  module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Calculate sum of spot positions in vaults with unrealized profit and loss",
  solana: {
    tvl,
  },
};

async function tvl(api) {

  const vaultAddresses = await fetchVaultAddresses();

  const { vaultUserAddresses, } = await fetchVaultUserAddressesWithOffset(vaultAddresses, 168);

  // Get all vault accounts first
  const accounts = await getMultipleAccounts(vaultUserAddresses)
  const deserializedData = accounts.filter((accountInfo) => !!accountInfo).map(deserializeUserPositions)

  // Collect unique market indices upfront
  const allSpotIndices = new Set()
  const allPerpIndices = new Set()
  
  deserializedData.forEach(({ spotPositions, perpPositions }) => {
    spotPositions?.forEach(pos => allSpotIndices.add(pos.market_index))
    perpPositions?.forEach(pos => allPerpIndices.add(pos.market_index))
  })

  // Batch fetch 
  const allKeys = [
    ...[...allSpotIndices].map(index => getVaultPublicKey('spot_market', index)),
    ...[...allPerpIndices].map(index => getVaultPublicKey('perp_market', index)),
  ]
  
  const allAccounts = await getMultipleAccounts(allKeys)
  
  // Create lookup maps
  const spotAccountMap = {}
  const perpAccountMap = {}
  
  let offset = 0
  ;[...allSpotIndices].forEach((index, i) => {
    spotAccountMap[index] = allAccounts[i]
    offset = i + 1
  })
  ;[...allPerpIndices].forEach((index, i) => {
    perpAccountMap[index] = allAccounts[i + offset]
  })

  // Process positions using the cached account data
  for (const { spotPositions, perpPositions } of deserializedData) {
    if (spotPositions?.length) {
      spotPositions.forEach(position => {
        const tokenMint = getTokenMintFromMarketIndex(position.market_index)
        const adjustedBalance = processSpotPosition(position, spotAccountMap[position.market_index])
        api.add(tokenMint, adjustedBalance)
      })
    }

    if (perpPositions?.length) {
      perpPositions.map(position => {
        const baseTokenMint = getPerpTokenMintFromMarketIndex(position.market_index)
        const { baseBalance, quoteBalance } = processPerpPosition(position)
        api.add(baseTokenMint, baseBalance)

        const quoteTokenMint = getTokenMintFromMarketIndex(0)
        api.add(quoteTokenMint, quoteBalance)

      })
    }
  }
}