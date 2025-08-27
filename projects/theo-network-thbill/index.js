// thBill token address
THBILL_ETH = "0x5FA487BCa6158c64046B2813623e20755091DA0b"

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ target: THBILL_ETH, abi: 'erc20:totalSupply' })
      api.add(THBILL_ETH, supply)
    },
  },
}
