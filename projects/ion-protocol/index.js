
const { lendingMarket } = require("../helper/methodologies");
const abi = {
  debt: "uint256:debt",
  totalCollateral: "uint256:totalGem",
  totalSupply: "uint256:totalSupply",
  underlyingLender: "address:underlying",
  underlyingCollateral: "address:GEM",
};

module.exports = {
  methodology: lendingMarket,
}

const config = {
  ethereum: {
    gems: [
      "0x3f6119B0328C27190bE39597213ea1729f061876", // weETH/wstETH GemJoin
      "0x3bC3AC09d1ee05393F2848d82cb420f347954432", // rsETH/wstETH GemJoin
      "0xD696f9EA3299113324B9065ab19b70758256cf16", // rswETH/wstETH GemJoin
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { gems } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await api.multiCall({ abi: 'address:POOL', calls: gems })
      const tokens = await api.multiCall({ abi: abi.underlyingLender, calls: pools })
      const gemUnderlyings = await api.multiCall({ abi: abi.underlyingCollateral, calls: gems })
      return api.sumTokens({ tokens: tokens.concat(gemUnderlyings), owners: pools.concat(gems) })
    },
    borrowed: async (api) => {
      const pools = await api.multiCall({ abi: 'address:POOL', calls: gems })
      const tokens = await api.multiCall({ abi: abi.underlyingLender, calls: pools })
      const debt = await api.multiCall({ abi: abi.debt, calls: pools })
      api.add(tokens, debt.map(b => b / 1e27))
    }
  }
})