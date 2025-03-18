const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");
const { startAlliumQuery, retrieveAlliumResults } = require("../helper/allium");
const { getCache, setCache } = require("../helper/cache");

const EIGEN = ADDRESSES.ethereum.EIGEN
const eigenStrategy = '0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7'
const bEIGEN = '0x83e9115d334d248ce39a6f36144aeab5b3456e75'

async function getEigenPods(timestamp) {
  const queryId = await getCache("eigenlayer", "eigenpods-query");
  const offset = 3;
  const newQuery = await startAlliumQuery(`
 select
  sum(balance) as sum
 from
  (
    select
      params
    from
      ethereum.decoded.logs
    where
      address = '0x91e677b07f7af907ec9a428aafa9fc14a0d3a338'
      and name = 'PodDeployed'
  ) pods, (
    select
  balance,
      WITHDRAWAL_ADDRESS,
  slot_timestamp
    from beacon.validator.balances
    where
      status in ('active_ongoing', 'pending_queued', 'pending_initialized', 'withdrawal_possible')
  and slot_timestamp = '${new Date(timestamp * 1e3 - offset * 24 * 3600e3).toISOString().split("T")[0]
    }T23:59:59'
  ) beacon where pods.params['eigenPod'] = beacon.WITHDRAWAL_ADDRESS`);
  await setCache("eigenlayer", "eigenpods-query", newQuery);
  const eigenPods = await retrieveAlliumResults(queryId);
  const sum = eigenPods[0]?.["sum"];
  if (!sum) {
    throw new Error("Empty eigenpods");
  }
  return sum;
}

const fetchLogs = async (api, eventAbi, extraKey) => getLogs2({
  api,
  target: "0x858646372cc42e1a627fce94aa7a7033e7cf075a",
  eventAbi,
  fromBlock: 17445564,
  extraKey,
});

const tvl = async ({ timestamp }, _b, _cb, { api }) => {
  api.add(nullAddress, await getEigenPods(timestamp) * 1e18)

  const [addeds, removeds] = await Promise.all([
    fetchLogs(api, "event StrategyAddedToDepositWhitelist(address strategy)", "StrategyAddedToDepositWhitelist"),
    fetchLogs(api, "event StrategyRemovedFromDepositWhitelist(address strategy)", "StrategyRemovedFromDepositWhitelist"),
  ]);
  const removeIdsSet = new Set(removeds.map((removed) => removed.strategy));

  const activeStrategies = addeds
    .map(item => item[0])
    .filter(strategy => !removeIdsSet.has(strategy));

  const rawUnderlyingTokens = await api.multiCall({ abi: 'address:underlyingToken', calls: activeStrategies })
  const underlyingTokens = rawUnderlyingTokens.filter((t) => t.toLowerCase() !== bEIGEN) // filter out bEIGEN
  return sumTokens2({ api, tokensAndOwners2: [underlyingTokens, activeStrategies] })

};

const staking = async (api) => {
  const balance = await api.call({ target: bEIGEN, params: [eigenStrategy], abi: 'erc20:balanceOf' })
  api.add(EIGEN, balance)
}

// https://github.com/Layr-Labs/eigenlayer-contracts/blob/master/script/output/M1_deployment_mainnet_2023_6_9.json
module.exports = {
  timetravel: false,
  ethereum: { tvl, staking },
};