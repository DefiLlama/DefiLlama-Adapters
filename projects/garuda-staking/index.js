const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async (api) => ({
      [nullAddress]: await api.call({ target: '0x3802c218221390025bceabbad5d8c59f40eb74b8', abi: 'uint256:totalSupply'})
    })
  }
}