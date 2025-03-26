const asBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6"

module.exports = {
  doublecounted: true,
  bsc: {
    tvl: async (api) => {

      // cake tvl
      const locker = '0x8E6Ce60cbC6402B8b780AdCfc069A00c177D2B18'
      const veCake = await api.call({ abi: 'address:veToken', target: locker })
      const cake = await api.call({ abi: 'address:token', target: locker })
      const totalDeposits = await api.call({ abi: 'erc20:balanceOf', target: veCake, params: locker })
      api.add(cake, totalDeposits)

      // asBNB tvl
      const asBNBMinter = '0x2f31ab8950c50080e77999fa456372f276952fd8'
      const token = await api.call({  abi: 'address:token', target: asBNBMinter})
      const bal = await api.call({  abi: 'uint256:totalTokens', target: asBNBMinter})
      api.add(token, bal)
    },
  }
}