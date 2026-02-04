const PAXG = '0x45804880de22913dafe09f4980848ece6ecbaf78'

module.exports = {
  methodology: "TVL corresponds to the total amount of PAXG minted",
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({target: PAXG, abi: 'erc20:totalSupply'})
      api.add(PAXG, totalSupply)
    },
  }
}

module.exports.hallmarks = [
  [1724371200, "Transfer fee was set to 0"],
]
