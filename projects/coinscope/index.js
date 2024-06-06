const ADDRESSES = require('../helper/coreAssets.json')

const { sumUnknownTokens } = require('../helper/unknownTokens')
module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL is calculated by summing the values of LP tokens held in lockers for a specific network",
};

const lockerFactories = {
  ethereum: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  bsc: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  polygon: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  avax: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  arbitrum: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  cronos: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  fantom: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  telos: "0x269D4d211CBc9845B006128717eE51b0D6524955",
  harmony: "0x097f5E933306ad0EbB1c0027B223a3dd153520BE",
}

Object.keys(lockerFactories).forEach(chain => {
  const factory = lockerFactories[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let fetchLength = 100
      let page = 0
      const tokensAndOwners = []
      let result
      do {
        result = await api.call({
          abi: abi.getTokens,
          target: factory,
          params: [true, page, fetchLength, ADDRESSES.null,],
        })
        tokensAndOwners.push(...result.pageTokens.map(i => i.lockerAddresses.map(j => [i.tokenAddress, j])))
        ++page
      } while (result.total === tokensAndOwners)
      return sumUnknownTokens({ api, tokensAndOwners: tokensAndOwners.flat(), useDefaultCoreAssets: true })
    }
  }
})

const abi = {
  "getTokens": "function getTokens(bool lp, uint256 page, uint256 pageSize, address token) view returns (tuple(address tokenAddress, uint8 decimals, uint256 totalSupply, bool pair, string pairToken1Name, address pairToken1Address, string pairToken2Name, address pairToken2Address, address pairDexAddress, string tokenName, string tokenSymbol, uint256 totalAmountLocked, uint256 currentAmountLocked, address[] lockerAddresses)[] pageTokens, uint256 total)",
}