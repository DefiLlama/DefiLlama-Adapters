const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require("../helper/cache/getLogs");
const { startAlliumQuery, retrieveAlliumResults } = require("../helper/allium");
const { getCache, setCache } = require("../helper/cache");

const ethereum = ADDRESSES.null
const EIGEN = ADDRESSES.ethereum.EIGEN
const eigenStrategy = '0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7'
const bEIGEN = '0x83e9115d334d248ce39a6f36144aeab5b3456e75'

const eventAbis = {
  podDeployed: "event PodDeployed(address indexed eigenPod, address indexed podOwner)",
  podOwnerDepositShares: "function podOwnerDepositShares(address podOwner) view returns (int256 shares)",
  currentCheckpoint: "function currentCheckpoint() view returns (bytes32 beaconBlockRoot, uint24 proofsRemaining, uint64 podBalanceGwei, int64 balanceDeltasGwei, uint64 prevBeaconBalanceGwei)",
  delegatedTo: "function delegatedTo(address staker) view returns (address operator)",
  getOperatorsShares: "function getOperatorsShares(address[] operators, address[] strategies) view returns (uint256[][])",
  getUserDelayedWithdrawals: "function getUserDelayedWithdrawals(address user) view returns (tuple(uint224 amount, uint32 blockCreated)[])",
  getQueuedWithdrawals: "function getQueuedWithdrawals(address staker) view returns (tuple(address staker, address delegatedTo, address withdrawer, uint256 nonce, uint32 startBlock, address[] strategies, uint256[] scaledShares)[] withdrawals, uint256[][] shares)",
  getClaimableUserDelayedWithdrawals: "function getClaimableUserDelayedWithdrawals(address user) view returns (tuple(uint224 amount, uint32 blockCreated)[])",
  sharesToUnderlying: "function sharesToUnderlying(uint256 amountShares) view returns (uint256)",
}

async function getEigenPods(timestamp) {
  const cacheKey = "eigenpods-query"
  const cacheNamespace = "eigenlayer"
  const contractAddress = "0x91e677b07f7af907ec9a428aafa9fc14a0d3a338"
  const offsetDays = 3

  const cachedQueryId = await getCache(cacheNamespace, cacheKey)

  const targetDate = new Date(timestamp * 1e3 - offsetDays * 24 * 3600e3)
    .toISOString()
    .split("T")[0] + "T23:59:59"

  const query = `
    SELECT SUM(balance) AS sum
    FROM (
      SELECT params
      FROM ethereum.decoded.logs
      WHERE address = '${contractAddress}'
        AND name = 'PodDeployed'
    ) pods,
    (
      SELECT balance, WITHDRAWAL_ADDRESS, slot_timestamp
      FROM beacon.validator.balances
      WHERE status IN (
        'active_ongoing',
        'pending_queued',
        'pending_initialized',
        'withdrawal_possible'
      )
        AND slot_timestamp = '${targetDate}'
    ) beacon
    WHERE pods.params['eigenPod'] = beacon.WITHDRAWAL_ADDRESS
  `

  const newQueryId = await startAlliumQuery(query)
  await setCache(cacheNamespace, cacheKey, newQueryId)

  const results = await retrieveAlliumResults(cachedQueryId)
  const sum = results[0]?.["sum"]

  if (!sum) {
    throw new Error("Empty eigenpods")
  }

  return sum
}

const fetchLogs = async (api, eventAbi, extraKey) => getLogs2({
  api,
  target: "0x858646372cc42e1a627fce94aa7a7033e7cf075a",
  eventAbi,
  fromBlock: 17445564,
  extraKey,
});

const tvl = async (api) => {
  api.add(ethereum, await getEigenPods(api.timestamp) * 1e18)
  const addeds = await fetchLogs(api, "event StrategyAddedToDepositWhitelist(address strategy)", "StrategyAddedToDepositWhitelist");
  const activeStrategies = addeds.map(item => item[0]);
  const rawUnderlyingTokens = (await api.multiCall({ abi: 'address:underlyingToken', calls: activeStrategies }));

  const totalShares = await api.multiCall({ calls: activeStrategies, abi: 'uint256:totalShares' })
  const underlyingCalls = totalShares.map((share, i) => ({ share, strategie: activeStrategies[i] }))
  const totalUnderlyings = await api.multiCall({ calls: underlyingCalls.map(({ share, strategie }) => ({ target: strategie, params: [share] })), abi: eventAbis.sharesToUnderlying })

  totalUnderlyings.forEach((bal, i) => {
    const t = rawUnderlyingTokens[i]
    api.add(t, bal)
  })

  api.removeTokenBalance(bEIGEN);
}

const staking = async (api) => {
  const balance = await api.call({ target: bEIGEN, params: [eigenStrategy], abi: 'erc20:balanceOf' })
  api.add(EIGEN, balance)
}

// https://github.com/Layr-Labs/eigenlayer-contracts/blob/master/script/output/M1_deployment_mainnet_2023_6_9.json
module.exports = {
  timetravel: false,
  ethereum: { tvl, staking }
}