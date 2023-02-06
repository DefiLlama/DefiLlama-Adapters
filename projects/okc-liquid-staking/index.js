const STContract = '0x97B05e6C5026D5480c4B6576A8699866eb58003b';

module.exports = {
  okexchain: {
    tvl: async (_, _1, _2, { api }) => {
      return { 'oec-token': (await api.call({ target: STContract, abi: "uint256:getTotalPooledOKT" })) / 1e18 }
    }
  }
}
