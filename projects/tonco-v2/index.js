const { getJettonBalances, addTonBalances } = require('../helper/chain/ton')
const tonUtils = require('../helper/utils/ton')

// TONCO v2 (CLMM): all pool liquidity is custodied by the router's jetton wallets
const ROUTER_V2 = 'EQAT0nCO20vC6gzpyUJbWI7ELnRvAAB3VHJ3Z1jXQsw6KGJ4'
// wGRAM is TONCO's proxy-TON contract (not a real jetton); the router's wGRAM wallet holds the native TON
const WGRAM = '0:7019100c8d363f08c3562a1cc178703e54f8e9dab0fdbc1debc1ea46d9ca3979'
const WGRAM_WALLET = 'EQC7D80WjxMZZmvdCJxWhR-X69p-WesFsRtn-fu-hq_MQY3S'

async function tvl(api) {
  const jettons = await getJettonBalances(ROUTER_V2)
  for (const [jetton, { balance }] of Object.entries(jettons)) {
    if (jetton.toLowerCase() === WGRAM) continue
    api.add(tonUtils.address(jetton).toString(), balance)
  }
  await addTonBalances({ api, addresses: [WGRAM_WALLET] })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of all jettons held by the TONCO v2 router (which custodies liquidity for every CLMM pool) plus the native TON held in its proxy-TON (wGRAM) wallet.',
  ton: { tvl },
}
