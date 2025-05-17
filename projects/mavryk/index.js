const MVRK = '0xec2fbe79236fa86bf2aa5d674dea20e2a1e7b01a'

module.exports = {
  methodology: "TVL corresponds to the total amount of MVRK minted",
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({target: MVRK, abi: 'erc20:totalSupply'})
      api.add(MVRK, totalSupply)
    }
  }
}
