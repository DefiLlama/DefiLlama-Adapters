const { config } = require('./config')
const abi = {
    "depositId": "uint256:depositId",
    "lockedToken": "function lockedToken(uint256) view returns (address tokenAddress, address withdrawalAddress, uint256 tokenAmount, uint256 unlockTime, string memory lockName, string memory lockDescription, bool withdrawn)"
  };const { sumUnknownTokens, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'Counts TVL of all the tokens locked on the Kimberlite Safe locker smart contracts'
};

Object.values(config).forEach(({ chain, locker, startBlock }) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await api.fetchList({  lengthAbi: abi.depositId, itemAbi: abi.lockedToken, target: locker, startFromOne: true, })
      const tokensAndOwners = data
        // .filter(i => !i.withdrawn)
        .map((i) => [i.tokenAddress, locker])
      return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: true, })
    }
  }
})