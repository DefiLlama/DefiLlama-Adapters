const { createIncrementArray } = require('../helper/utils')

const channels = '0x11bFEE9D8625ac4cDa6Ce52EeBF5caC7DC033d15';
const filda = '0xE796c55d6af868D8c5E4A92e4fbCF8D8F88AcDED';
const lendhub = '0xdA0519AA3F097A3A5b1325cb1D380C765d8F1D70';
const lendhubeth = '0x15155042F8d13Db274224AF4530397f640f69274';

const fildaSwapV2Address = "0xa7a0EA0C5D2257e44Ad87d10DB90158c9c5c54b3"

const vaultGroup = [
  "0x6FF92A0e4dA9432a79748A15c5B8eCeE6CF0eE66",
  "0x95c258E41f5d204426C33628928b7Cc10FfcF866",
  "0x70941A63D4E24684Bd746432123Da1fE0bFA1A35",
  "0x22BAd7190D3585F6be4B9fCed192E9343ec9d5c7",
  "0xB567bd78A4Ef08EE9C08762716B1699C46bA5ea3",
  "0xd96e3FeDbF4640063F2B20Bd7B646fFbe3c774FF",
  "0x80Da2161a80f50fea78BE73044E39fE5361aC0dC",
  "0xE308880c215246Fa78753DE7756F9fc814D1C186",
  "0x9213c6269Faed1dE6102A198d05a6f9E9D70e1D0",
  "0x996a0e31508E93EB53fd27d216E111fB08E22255",
  "0x9bd25Ed64F55f317d0404CCD063631CbfC4fc90b",
  "0x7e1Ac905214214c1E339aaFBA72E2Ce29a7bEC22",
]

const VaultGroupBsc = [
  "0xcB08DA2339d562b66b314d2bBfB580CB87FFBD76",
  "0x3253041F27416c975FFb0100b08734187F82c8A2",
  "0x0B28a55dbBd6c5DdD4D1d7157361e9D6D0CcEfC0",
  "0xAf996B5E33007ed5EB33eaAe817ad8E1310CCebc",
  "0x2E128EB2EE787428307A7B246d02C1801788e1A6",
  "0x9F4198C4a73c103Bc9b1c34D1f680d4E43D901AF",
  "0x024F05c70F203fb77f27b00422534cC33E1FB69d",
  "0xcd8EF3E3A7b25741cE5B8C728F582cF748b60b1A",
]

async function staking(api) {
  const { activeShares, pendingSharesToAdd, pendingSharesToReduce } = await api.call({
    target: "0xfbac8c66d9b7461eefa7d8601568887c7b6f96ad",
    abi: "function sharesAndRewardsInfo() view returns (uint256 activeShares, uint256 pendingSharesToAdd, uint256 pendingSharesToReduce, uint256 rewards, uint256 claimedRewards, uint256 lastUpdatedEpochFlag)",
  })
  const token = '0x48C859531254F25e57D1C1A8E030Ef0B1c895c27'
  api.add(token, activeShares)
  api.add(token, pendingSharesToAdd)
  api.add(token, pendingSharesToReduce * -1)
}

async function addDexBalance(api, dex, count = 2) {
  const isV2 = api.chain === 'bsc' || dex === fildaSwapV2Address
  const calls = createIncrementArray(count)
  let coinsAbi = 'function coins(uint256) view returns (address)'
  let balanceAbi = 'function balances(uint256) view returns (uint256)'
  let curve = dex
  if (!isV2) {
    coinsAbi = coinsAbi.replace('uint256', 'int128')
    balanceAbi = balanceAbi.replace('uint256', 'int128')
    curve = await api.call({ target: dex, abi: 'address:curve' })
  }
  const coins = await api.multiCall({ abi: coinsAbi, calls, target: dex })
  const bals = await api.multiCall({ abi: balanceAbi, calls, target: curve })
  if (isV2)
    return api.add(coins, bals)

  const tokens = await api.multiCall({ abi: 'address:underlying', calls: coins })
  const eRates = await api.multiCall({ abi: 'uint256:exchangeRateStored', calls: coins })
  api.add(tokens, eRates.map((e, i) => e * bals[i] / 1e18))
}

async function tvl(api) {

  // dex tvl
  await addDexBalance(api, '0xc57220b65dd9200562aa73b850c06be7bd632b57', 3)

  // vault balance
  const tokens = await api.multiCall({ abi: 'address:want', calls: VaultGroupBsc })
  const bals1 = await api.multiCall({ abi: 'uint256:balance', calls: VaultGroupBsc })
  api.add(tokens, bals1)
}

async function hecoTvl(api) {

  const dexes = [filda, channels, lendhub, lendhubeth, fildaSwapV2Address]
  await Promise.all(dexes.map(dex => addDexBalance(api, dex)))
  // vault balance
  const tokens = await api.multiCall({ abi: 'address:want', calls: vaultGroup })
  const bals1 = await api.multiCall({ abi: 'uint256:balance', calls: vaultGroup })
  api.add(tokens, bals1)
}

module.exports = {
  doublecounted: true,
  heco: {
    tvl: hecoTvl,
    //  staking,
  },
  bsc: {
    tvl
  },
}
