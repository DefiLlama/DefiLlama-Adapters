const sAMLP_arbitrum = '0xbC08F30c18a79a3a18dBbd40931C551F91EDB9dB'
const sAHLP_arbitrum = '0x50c30f24b957B1ac9e31558e55Bf7dc4ab685eA9'

module.exports = {
  methodology: 'counts the number of sAMLP and sAHLP tokens in the contract.',
  arbitrum: {
    tvl: async (api) => {
      const [sAMLP_supply, sAHLP_supply] = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: [sAMLP_arbitrum, sAHLP_arbitrum]
      })
      api.add(sAMLP_arbitrum, sAMLP_supply)
      api.add(sAHLP_arbitrum, sAHLP_supply)
    }
  }
}