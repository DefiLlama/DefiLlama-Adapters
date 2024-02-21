const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const vaults = {
    polygon: "0xd1bb7d35db39954d43e16f65f09dd0766a772cff",
}

const assets = {
    polygon: ADDRESSES.polygon.USDC, //USDC
}

const abi = "uint256:checkBalance"

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(vaults).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
        const { output } = await sdk.api.abi.call({ chain, block, abi, target: vaults[chain]})
        return {
            // refilling wont work because at mar 26th the decimals used by checkBalance() changed
            [`${chain}:${assets[chain]}`]: output/100
        }
    }
  }
})
