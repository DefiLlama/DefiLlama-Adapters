const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const NATIVE_ADDRESS = "NATIVE";

const config = {
  rollux: {
    contractAddress: "0x66ff2f0AC3214758D1e61B16b41e3d5e62CAEcF1",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.rollux.USDC, decimals: 6 },
      { name: "usdt", address: ADDRESSES.rollux.USDT, decimals: 6 },
      { name: "wbtc", address: ADDRESSES.rollux.WBTC, decimals: 8 },
      { name: "weth", address: ADDRESSES.rollux.WETH, decimals: 18 },
      { name: "wsys", address: ADDRESSES.rollux.WSYS, decimals: 18 },
      { name: "sys", address: NATIVE_ADDRESS, decimals: 18 },
    ]
  }
}

module.exports = {
  methodology: "All tokens locked in Chainge Address.",
};

Object.keys(config).forEach(chain => {
  let { contractAddress: owner, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      tokens = tokens.map(i => i.address === NATIVE_ADDRESS ? nullAddress: i.address)
      return sumTokens2({ chain, block, owner, tokens, })
    }
  }
})