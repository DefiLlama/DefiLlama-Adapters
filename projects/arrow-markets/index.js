async function staking(api) {
  const bal = await api.call({ abi: 'uint256:totalStakeAmounts', target: '0x9193957DC6d298a83afdA45A83C24c6C397b135f' })
  api.add('0x5c5e384Bd4e36724B2562cCAA582aFd125277C9B', bal)
}

module.exports = {
  avax: {
    tvl: () => ({}),
    staking,
  }
}