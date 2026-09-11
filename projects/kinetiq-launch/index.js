const { getLogs } = require('../helper/cache/getLogs')

// Kinetiq Launch lets anyone deploy an LST. New markets are discovered on-chain from the
// factory's MarketBonded event, so the adapter picks up future LSTs with no code changes.
const FACTORY = '0x188a8CFa039C049c6B076C52164E5d51ee207a98'
const FROM_BLOCK = 37414909

const abi = {
  MarketBonded: 'event MarketBonded(bytes32 indexed marketId, address indexed deployer, uint256 opBond)',
  getMarketContracts: 'function getMarketContracts(bytes32 marketId) view returns ((address router, address exManager, address exLST, address stakingAccountant, address validatorManager, address oracleManager, address rewardShareTracker, address ghostLST, address bwq, address defaultOracle, address oracleAdapter, address launchFeeSplitter, address stakeFeesThrottle) contracts)',
  totalStaked: 'uint256:totalStaked',
  totalClaimed: 'uint256:totalClaimed',
  totalRewards: 'uint256:totalRewards',
  totalSlashing: 'uint256:totalSlashing',
}

const tvl = async (api) => {
  const logs = await getLogs({ api, target: FACTORY, fromBlock: FROM_BLOCK, eventAbi: abi.MarketBonded, onlyArgs: true })
  const marketIds = [...new Set(logs.map(i => i.marketId))]

  const contracts = await api.multiCall({ abi: abi.getMarketContracts, calls: marketIds.map(id => ({ target: FACTORY, params: [id] })) })
  const accountants = contracts.map(i => i.stakingAccountant)

  const [staked, claimed, rewards, slashing] = await Promise.all([
    api.multiCall({ abi: abi.totalStaked, calls: accountants }),
    api.multiCall({ abi: abi.totalClaimed, calls: accountants }),
    api.multiCall({ abi: abi.totalRewards, calls: accountants }),
    api.multiCall({ abi: abi.totalSlashing, calls: accountants }),
  ])

  accountants.forEach((_, i) =>
    api.addGasToken(BigInt(staked[i]) - BigInt(claimed[i]) + BigInt(rewards[i]) - BigInt(slashing[i])))
}

module.exports = {
  methodology: 'Sums the HYPE backing every bonded Kinetiq Launch LST. Bonded markets are discovered on-chain from the factory MarketBonded event and resolved via getMarketContracts; each market\'s TVL is totalStaked - totalClaimed + totalRewards - totalSlashing read from its staking accountant.',
  hyperliquid: { tvl },
}
