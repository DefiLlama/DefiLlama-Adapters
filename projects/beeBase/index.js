const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require("../helper/unwrapLPs")

const Contracts = {
  Protocol: "0x8a2fFD429d33FBfC6f5A91aa207e48bB095Db7d9",
  LP: "0x500e45173f466c058e6dcecd15b27a1e091d92d4",
  Tokens: {
    ETH: ADDRESSES.null,
    USDC: ADDRESSES.base.USDC,
    WETH: ADDRESSES.base.WETH,
    USDT: ADDRESSES.base.USDT,
    BEEBASE: '0xFD09F108D1728E6B6eD241ccd254775e322f1ed6'
  },
}

module.exports = {
  base: {
    tvl: sumTokensExport({
      owners: [
        Contracts.Protocol,
        Contracts.LP,
        Contracts.Tokens.BEEBASE
      ],
      tokens: Object.values(Contracts.Tokens),
    }),
  },
}
