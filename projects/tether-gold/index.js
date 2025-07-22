const XAUt = '0x68749665ff8d2d112fa859aa293f07a622782f38'

module.exports = {
  methodology: "TVL corresponds to the total amount of XAUt minted",
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({target: XAUt, abi: 'erc20:totalSupply'})
      api.add(XAUt, totalSupply)
    }
  }
}
