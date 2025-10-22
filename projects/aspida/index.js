module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: "0xFC87753Df5Ef5C368b5FBA8D4C5043b77e8C5b39", abi: "uint256:totalSupply" });
      api.addGasToken(totalSupply)
    }
  }
}
