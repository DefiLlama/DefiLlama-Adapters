const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

// Gloam's shielded pool (ShieldPoolPayments), the same address on every chain except Elysium.
const POOL = '0x39e28cde55cab798874746ac52cb4b5cc99a0194'
const ELYSIUM_POOL = '0x89d3042390204f57b8b4f8949d3c2203e4002164'
const GLOAM = '0xDcD885F5c60b3aD49F6D58718696417314e8724d'
const OUSD = '0x20c0000000000000000000006a37da5c996874be'
const KNTQ = '0xe45a355d9e9cad2ad85f2d03e3ee3102a036acf0'

// the assets the pool accepts, from its DepositLimitSet events
async function poolAssets(api, fromBlock) {
  const logs = await getLogs2({ api, target: POOL, eventAbi: 'event DepositLimitSet(address indexed asset, uint128 perDeposit, uint128 total)', fromBlock, extraKey: 'deposit-limit-set' })
  return [...new Set(logs.map(l => l.asset.toLowerCase()))].filter(t => t !== GLOAM.toLowerCase())
}

const fromLogs = (fromBlock) => async (api) => api.sumTokens({ owner: POOL, tokens: await poolAssets(api, fromBlock) })

module.exports = {
  methodology: 'TVL is the tokens held by the Gloam shielded pool on Robinhood Chain, Tempo, Base, Ethereum and Elysium. On Robinhood Chain, Base and Ethereum the accepted assets are discovered from the pool\'s DepositLimitSet events. $GLOAM held in the pool is the protocol\'s own token and is counted under staking.',
  start: '2026-10-21',
  robinhood: {
    tvl: fromLogs(94194599),
    staking: staking(POOL, GLOAM),
  },
  tempo: {
    // static: the SDK's Tempo RPC rejects getLogs ranges; these are all of the pool's DepositLimitSet assets
    tvl: sumTokensExport({ owner: POOL, tokens: [ADDRESSES.tempo.pathUSD, ADDRESSES.tempo.USDC_E, ADDRESSES.tempo.USDT0, OUSD] }),
  },
  base: { tvl: fromLogs(53109632) },
  ethereum: { tvl: fromLogs(26276183) },
  elysium: {
    // the Elysium pool also holds native HYPE (address 0)
    tvl: sumTokensExport({ owner: ELYSIUM_POOL, tokens: [ADDRESSES.null, ADDRESSES.elysium.USDC, KNTQ] }),
  },
}
