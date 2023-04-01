const sdk = require("@defillama/sdk");
const FACTORY_CONTRACT = "0x3B4b6B14d07A645005658E6Ea697edb0BD7bf2b1";

const abis = {
  "getStakingTokens": "function getStakingTokens() view returns (address[])",
  "stakingPoolInfoByStakingToken": "function stakingPoolInfoByStakingToken(address) view returns (address,uint256,uint256,uint256)",
  "symbol": "function symbol() view returns (string)",
  "totalSupply": "uint256:totalSupply",
  "getReserves": "function getReserves() view returns (uint112,uint112,uint32)"
}

async function tvl(_, _1, _2, { api }) {
  const stakingTokens = await api.call({
    abi: abis.getStakingTokens,
    target: FACTORY_CONTRACT,
  });

  const poolInfos = await api.multiCall({
    abi: abis.stakingPoolInfoByStakingToken,
    calls: stakingTokens,
    target: FACTORY_CONTRACT
  })

  const tokenSymbols = await api.multiCall({
    abi: abis.symbol,
    calls: stakingTokens,
  })

  const beforePoolAddresses = poolInfos.map(pool => pool[0])
  const poolAddresses = beforePoolAddresses.filter((pool, idx) => !tokenSymbols[idx] || !tokenSymbols[idx].includes('UNI'))

  const lpAddresses = stakingTokens.filter((token, idx) => tokenSymbols[idx] && tokenSymbols[idx].includes('UNI'))

  const lpReservesList = await api.multiCall({
    abi: abis.getReserves,
    calls: lpAddresses
  })

  const poolTvlList = await api.multiCall({
    abi: abis.totalSupply,
    calls: poolAddresses
  })

  const balances = {}
  poolTvlList.forEach((cv, idx) => {
    balances[stakingTokens[idx]] = cv
  })

  return balances
}

module.exports = {
  start: 16831303,
  ethereum: {
    tvl
  }
};
