const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const getAludelDataABI = "function getAludelData() view returns ((address stakingToken, address rewardToken, address rewardPool, (uint256 floor, uint256 ceiling, uint256 time) rewardScaling, uint256 rewardSharesOutstanding, uint256 totalStake, uint256 totalStakeUnits, uint256 lastUpdate, (uint256 duration, uint256 start, uint256 shares)[] rewardSchedules) aludel)"

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0xF016fa84D5f3a252409a63b5cb89B555A0d27Ccf',
    eventAbi: 'event InstanceAdded (address instance)',
    onlyArgs: true,
    fromBlock: 11881110,
  })
  const pools = logs.map(l => l.instance)
  const owners = await api.multiCall({ abi: 'address:owner', calls: pools })
  const data = await api.multiCall({ abi: getAludelDataABI, calls: owners })
  data.forEach(i => api.add(i.stakingToken, i.totalStake))
  await sumTokens2({ api, resolveLP: true, })
  api.removeTokenBalance('0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab')
  return api.getBalances()
}

module.exports = {
  ethereum: {
    tvl,
    pool2: () => ({}),
  }
}
