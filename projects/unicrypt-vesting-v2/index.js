const { getCache, setCache } = require('../helper/cache')
const { sumUnknownTokens } = require('../helper/unknownTokens')
const { getUniqueAddresses, sliceIntoChunks } = require('../helper/utils')

const contracts = {
  ethereum: '0xA98F06312b7614523d0f5e725e15fd20fB1b99F5',
  optimism: '0x2Ba0cb1153f10d2A95E16e0581324244b9227dDB',
  bsc: '0x7f3f9f4ED8987B78adC448a840169A0FD5AFFAAB',
  unichain: '0x3dd1e6c7F905322136E5DF5ECf638059877E0a20',
  polygon: '0x09e9f68F72917984e333BD2E18Adae5fAFf97587',
  base: '0x7ca3dE7D58A0bCAd115184597553485A919320c5',
  krown: '0xF28704c691290547924e2129D407dA36bda8ce0f',
  arbitrum: '0x7f3f9f4ED8987B78adC448a840169A0FD5AFFAAB',
  avax: '0x586FEfeeFA117cEC8f32a6B2a0ABEE443315eb87',
  robinhood: '0xB31eAEFA2A0bdC53Df6D7a7f0f289b6eE1a8AAF3',
}

const nextVestingIdAbi = 'uint256:nextVestingId'
const vestingScheduleAbi = 'function vestingSchedules(uint256) view returns (address token, address creator, address beneficiary, uint256 totalAmount, uint256 released, bool isSoft, bool isNftized, bool cancelled, bool isTopable, uint8 vestingType)'
const project = 'bulky/unicrypt-vesting-v2'

async function tvl(api) {
  const contract = contracts[api.chain].toLowerCase()
  const cache = await getCache(project, api.chain)
  if (!cache.tokens) cache.tokens = []
  if (!cache.lastVestingId) cache.lastVestingId = 0

  const nextVestingId = Number(await api.call({ target: contract, abi: nextVestingIdAbi }))
  const calls = Array.from(
    { length: nextVestingId - cache.lastVestingId },
    (_, i) => ({ target: contract, params: i + cache.lastVestingId })
  )
  const schedules = []
  for (const chunk of sliceIntoChunks(calls, 250)) {
    schedules.push(...await api.multiCall({ abi: vestingScheduleAbi, calls: chunk, permitFailure: true }))
  }
  if (schedules.some(schedule => !schedule)) throw new Error('Failed to fetch all vesting schedules')

  cache.tokens.push(...schedules.map(schedule => schedule.token))
  cache.tokens = getUniqueAddresses(cache.tokens)
  cache.lastVestingId = nextVestingId

  const balances = await sumUnknownTokens({
    chain: api.chain,
    block: api.block,
    owner: contract,
    tokens: cache.tokens,
    cache,
    useDefaultCoreAssets: true,
  })

  await setCache(project, api.chain, cache)
  return balances
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts ERC-20 balances held by Unicrypt Vesting V2 contracts across supported chains.',
}

Object.keys(contracts).forEach(chain => {
  module.exports[chain] = { tvl }
})
