const { pool2s } = require("../helper/pool2");
const sdk = require('@defillama/sdk')
const { getUniqueAddresses, sliceIntoChunks } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")
const { getLPList } = require('../helper/cache/sumUnknownTokens')
const { getLowValueCache } = require('../helper/cache/lowValue')
const { getCoreAssets } = require('../helper/tokenMapping')

const abi = {
  getReserves: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
  depositId: "uint256:depositId",
  lockedToken: "function lockedToken(uint256) view returns (address tokenAddress, address withdrawalAddress, uint256 tokenAmount, uint256 unlockTime, bool withdrawn)",
}

const project = 'bulky/deeplock'

const lockers = [
  "0x10dD7FD1Bf3753235068ea757f2018dFef94B257", // v1
  "0x3f4D6bf08CB7A003488Ef082102C2e6418a4551e", // v2
]

const stakingPool2Contracts = [
  "0x27F33DE201679A05A1a3ff7cB40a33b4aA28758e",
  "0x03dab688d32507B53Cc91265FA47760b13941250",
];
const lpAddresses = [
  "0xc1fccf4170fa9126d6fb65ffc0dd5a680a704094",
  "0x596e48cde23ba55adc2b8b00b4ef472184e2a9e3",
];

const blacklist = [
  '0x25f4a012b06b43aff3918acbf0cc113119aea194',
  '0xce80ab50fca1564426ca09a977b029377c50c909',
  '0xa3f0a9ad24a749f3aa14f33c019b708259cfa514',
  '0xdde9e8d669115542eff4923c647c53b46c1735f9',
  '0x9f0eec882f958cbeef99cab17ea3cf5909c62e77',
  '0x168926cd2b2559c8359a7c0ffd2be7ad56e1f2a4',
  '0x7963deca5ec22ffc4629f4767de372e1c81ad8fa',
  '0xa6467d83a32452ab9091ca4e8edc3831f8aab088',
  '0xe18af4897e0fa706ca65ffefef24e5f8ee1d1cea',
  '0x19024b0ed8d4e4d5cbf7dfa94a82804bc9a79be3',
  '0x347c5b51449074c5487cc193459c5babeebcef07',
  '0x290183a09390a9d34c10171cf84c9c36b6cad9ed',
  '0xc0600c41273e71dc8736c5e2128c7979ce3bbbac',
  '0x5880a0aebd1af8c68497088293ca548c63fd7b0f',
  '0x3172057a27b0dbc48a99b8fe2222c4535d56b44c',
  '0xf2abb94b826199311d51706e6b32aa3bf8539c89',
  '0x7108955947e352b351c4bB20b0a31A3598E7FEEC',
  '0xa6124221ed6d2e2f18da78c3cce6f52a8eec1a69',
  '0x85a5879ed3b3d11bb370d94b79db80b984f5cbf9',
  '0x17a273794516390043814059dc7f29f789972d0a',
  '0x3f4D6bf08CB7A003488Ef082102C2e6418a4551e',
  '0x03a3cDa7F684Db91536e5b36DC8e9077dC451081',
  '0xd43b226d365d8b22ba472afc2fa769b356eb5d47',
  '0x8d98a4e36ca048b8e4616564e5a8ebb78895ddff',
  '0x1337ace33c2b3fc17d85f33dbd0ed73a896148b5',
  '0x486dccaf152b271630216d62c00188f2558f6bec',
  '0xf0ee026f572c4a229dc67a692244e90abac29ec2',
].map(i => i.toLowerCase())

const LPS_PER_GROUP = 5000

// The lockers hold 50k+ LP tokens and almost all of them are worth next to nothing, yet each one cost a balance, a
// total supply and a reserves read on every run. For an LP paired with a core asset the vesting helper counts exactly
// (locker balance / total supply) of the pool's core side, twice, so that is what is stored for such an LP when it is
// worth under $100: it is then counted from the store and read again once a week. Every other LP (worth more, paired
// with no core asset, or with a failed read) still goes through the vesting helper on every run.
async function addLockedLPs(api, cache, vault, tokens) {
  const coreAssets = new Set(getCoreAssets(api.chain))
  tokens = getUniqueAddresses(tokens).filter(token => !blacklist.includes(token))
  // the helper counts only LP tokens (judged by symbol, stored in `cache`), so the same list is used here
  const lps = await getLPList({ lps: tokens, chain: api.chain, block: api.block, cache })
  const lowValue = await getLowValueCache({ api, project: 'deeplock', key: `${api.chain}-${vault.toLowerCase()}`, checkpointEvery: LPS_PER_GROUP })
  const prices = await sdk.coins.getPrices([...coreAssets].map(token => `${api.chain}:${token}`), 'now')
  if (!cache.pairData) cache.pairData = {}
  const rest = []

  for (const group of sliceIntoChunks(lowValue.filter(lps), LPS_PER_GROUP)) {
    const unknown = group.filter(lp => !cache.pairData[lp]?.token0Address || !cache.pairData[lp]?.token1Address)
    const token0s = await api.multiCall({ abi: 'address:token0', calls: unknown, permitFailure: true })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: unknown, permitFailure: true })
    unknown.forEach((lp, i) => {
      if (token0s[i] && token1s[i]) cache.pairData[lp] = { token0Address: token0s[i].toLowerCase(), token1Address: token1s[i].toLowerCase() }
    })
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: group.map(lp => ({ target: lp, params: vault })), permitFailure: true })
    const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: group, permitFailure: true })
    const reserves = await api.multiCall({ abi: abi.getReserves, calls: group, permitFailure: true })

    const results = []
    group.forEach((lp, i) => {
      const pair = cache.pairData[lp]
      if (balances[i] == null || supplies[i] == null || !reserves[i] || !pair?.token0Address) return rest.push(lp)
      if (+balances[i] === 0) return results.push([lp, {}]) // withdrawn
      const isCore0 = coreAssets.has(pair.token0Address)
      const isCore1 = coreAssets.has(pair.token1Address)
      if (!isCore0 && !isCore1) return rest.push(lp)
      const ratio = Math.min(1, +supplies[i] > 0 ? +balances[i] / +supplies[i] : 0)
      const multiplier = isCore0 && isCore1 ? 1 : 2
      const held = {}
      let usdValue = 0
      const add = (token, reserve) => {
        const amount = reserve * multiplier * ratio
        const price = prices[`${api.chain}:${token}`]
        usdValue += price?.price === undefined ? Infinity : amount / 10 ** (price.decimals ?? 0) * price.price
        held[token] = BigInt(Math.floor(amount)).toString()
      }
      if (isCore0) add(pair.token0Address, +reserves[i]._reserve0)
      if (isCore1) add(pair.token1Address, +reserves[i]._reserve1)
      if (usdValue < 90) results.push([lp, held]) // a margin under the $100 the store keeps, so its own check agrees
      else rest.push(lp)
    })
    await lowValue.record(results)
  }
  await lowValue.save()

  if (rest.length) await vestingHelper({ api, cache, useDefaultCoreAssets: true, blacklist, owner: vault, tokens: rest, })
}

async function tvl(api) {
  const cache = (await getCache(project, api.chain)) || {}
  if (!cache.vaults) cache.vaults = {}

  const lengths = await api.multiCall({ abi: abi.depositId, calls: lockers })

  for (const [i, vault] of lockers.entries()) {
    if (!cache.vaults[vault]) cache.vaults[vault] = { lastTotalId: 1, tokens: [] }
    const cCache = cache.vaults[vault]
    const length = +lengths[i]

    // deposit ids are 1-based; only pull the ones we haven't seen yet
    const calls = []
    for (let id = cCache.lastTotalId; id <= length; id++) calls.push({ target: vault, params: id })
    cCache.lastTotalId = length + 1

    const locks = await api.multiCall({ abi: abi.lockedToken, calls, permitFailure: true })
    // a failed read is tried again next run: the ids are only marked as seen when all of them were read
    if (locks.some(lock => !lock)) cCache.lastTotalId -= calls.length
    cCache.tokens = getUniqueAddresses([...cCache.tokens, ...locks.filter(Boolean).map(i => i.tokenAddress)])

    await addLockedLPs(api, cache, vault, cCache.tokens)
  }

  await setCache(project, api.chain, cache)

  api.removeTokenBalance('0x60de5f9386b637fe97af1cc05f25548e9baaee19') // deeplock token
  api.removeTokenBalance('0x64f36701138f0e85cc10c34ea535fdbadcb54147') // Anon INU - incorrect price
}

module.exports = {
  isHeavyProtocol: true,
  misrepresentedTokens: true,
  methodology: "Counts tvl of all the tokens locked on the locker through DeepLockLocker Contracts",
  bsc: {
    pool2: pool2s(stakingPool2Contracts, lpAddresses),
    tvl,
  },
};
