const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => ({
      [nullAddress]: await api.call({ target: '0xf951E335afb289353dc249e82926178EaC7DEd78', abi: 'uint256:totalETHDeposited'})
    })
  }
}