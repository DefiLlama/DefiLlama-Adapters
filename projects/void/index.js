
module.exports = {
  fantom: {
    tvl: () => 0,
    staking: async (api) => {
      const bal = await api.call({ abi: 'uint256:getTotalInvested', target: '0xe0d4ed2613f6c8737234d28d24b9c5d7f106bd28' })
      api.add('0x80F2B8CdbC470c4DB4452Cc7e4a62F5277Db7061', bal)
    },
  }
}