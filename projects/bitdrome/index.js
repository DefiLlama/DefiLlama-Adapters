async function tvl(api) {
  const TwoPoolFactory = '0x634FB7F07BDb77281c64a57F69E1EB19583E727a'
  const pools = await api.fetchList({ lengthAbi: 'pool_count', itemAbi: 'pool_list', target: TwoPoolFactory })
  const tokens = await api.multiCall({ target: TwoPoolFactory, calls: pools, abi: 'function get_coins(address _pool) view returns (address[2])' })
  const ownerTokens = tokens.map((v, i) => [v, pools[i]])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  bevm: {
    tvl
  }
}