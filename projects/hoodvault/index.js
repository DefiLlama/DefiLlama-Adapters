const NFT = "0x9482b1B0D96A3F7ABA14b9C433F7032FEe11d649";
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const accounts = (await api.fetchList({ lengthAbi: 'nextTokenId', itemAbi: 'accountOf', target: NFT, startFromOne: true })).filter(i => i !== ADDRESSES.null)
  const tokens = await api.multiCall({ abi: "function backingAssets() view returns (address[] tokens, uint256[] depositedAmounts)", calls: accounts, field: 'tokens' })
  const ownerTokens = accounts.map((owner, i) => [tokens[i], owner])
  return api.sumTokens({ ownerTokens, blacklistedTokens: 
    [
      '0x7c017eba1dcc8f355a2efaa246868292c10969c0', // HoodMarket, exclude project's own token
    ]
  })
}

module.exports = {
  methodology: "Value of tokens in all the HoodVault ERC-6551 vaults",
  robinhood: {
    tvl,
  },
};
