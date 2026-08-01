module.exports = {
  methodology: "TVL represents the total amount of STRAX tokens locked by STRAX Token Holders in the Stratis Liquid Staking Protocol.",
  stratis: {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: '0x81c3fd1c1aD16e31bf75F4aF25a2f9390608C609', abi: 'uint256:totalSupply' })
      return { 'stratis': totalSupply / 1e18 }
    }
  }
}
