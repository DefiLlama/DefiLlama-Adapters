module.exports = {
  kava: {
    tvl,
  },
};

async function tvl(api) {
  const pools = await api.fetchList({  lengthAbi:'allPoolsLength' , itemAbi: 'allPools', target: '0xbD4C56E952c238389AEE995E1ed504cA646D199B'})
  const poolAbi = "function getPoolTokensAndBalances() view returns (address[] tokens, uint256[] balances)"
  const poolDatas = await api.multiCall({  abi: poolAbi, calls: pools })
  const tokens = poolDatas.map(pool => pool.tokens).flat()
  return api.sumTokens({ owner: '0x923A7273480e73439b73b065d096c58034968504', tokens,})
}
