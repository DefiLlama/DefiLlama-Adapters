const { getCache, setCache } = require('../helper/cache')
const { post } = require('../helper/http')

const SSV_NETWORK = '0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1'
const FROM_BLOCK = 17507487
const CATCH_UP_BLOCKS = 50_000
const FINALITY_BLOCKS = 64
const BEACON_VALIDATORS = 'https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/finalized/validators'
const BEACON_BATCH = 2000

const CLUSTER = '(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster'
const VALIDATOR_ADDED = `event ValidatorAdded(address indexed owner, uint64[] operatorIds, bytes publicKey, bytes shares, ${CLUSTER})`
const VALIDATOR_REMOVED = `event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, ${CLUSTER})`

async function getValidatorKeys(api) {
  const cache = await getCache('ssv-network', 'validators')
  const live = new Set(cache.keys ?? [])
  let toBlock = cache.toBlock ?? FROM_BLOCK - 1
  const end = (await api.getBlock()) - FINALITY_BLOCKS
  let savedAt = Date.now()
  while (toBlock < end) {
    const fromBlock = toBlock + 1
    toBlock = Math.min(toBlock + CATCH_UP_BLOCKS, end)
    const [added, removed] = await Promise.all([VALIDATOR_ADDED, VALIDATOR_REMOVED].map(eventAbi => api.getLogs({ target: SSV_NETWORK, eventAbi, fromBlock, toBlock, skipCache: true })))
    const order = log => log.blockNumber * 1e5 + Number(log.logIndex ?? log.index)
    const events = [...added.map(log => [log, true]), ...removed.map(log => [log, false])].sort(([a], [b]) => order(a) - order(b))
    events.forEach(([log, isAdd]) => { const key = log.args.publicKey.toLowerCase(); isAdd ? live.add(key) : live.delete(key) })
    if (toBlock === end || Date.now() - savedAt > 60_000) {
      await setCache('ssv-network', 'validators', { toBlock, keys: [...live] })
      savedAt = Date.now()
    }
  }
  return [...live]
}

async function tvl(api) {
  const keys = await getValidatorKeys(api)
  let gwei = 0n
  for (let i = 0; i < keys.length; i += BEACON_BATCH) {
    const { data } = await post(BEACON_VALIDATORS, { ids: keys.slice(i, i + BEACON_BATCH) })
    data.forEach(({ balance }) => gwei += BigInt(balance))
  }
  api.addGasToken((gwei * 10n ** 9n).toString())
}

module.exports = {
  timetravel: false,
  methodology: 'Sums the beacon chain balances of all validators registered on the SSV Network contract (ValidatorAdded minus ValidatorRemoved, replayed in chain order).',
  ethereum: { tvl },
}
