const axios = require('axios')
axios.defaults.headers.common['User-Agent'] = 'DefiLlama-Nolus-Adapter/1.0 (https://defillama.com)'
const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')
const { sleep } = require('../helper/utils')

// Admin contract that holds a registry of all active protocols
const ADMIN_CONTRACT = 'nolus1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jsqxf8nd'

const query = (contract, data) => queryContract({ contract, chain: 'nolus', data })

async function getProtocols() {
  const names = await query(ADMIN_CONTRACT, { protocols: {} })
  const protocols = []
  for (const name of names) {
    await sleep(200)
    const details = await query(ADMIN_CONTRACT, { protocol: name })
    if (details?.contracts) protocols.push({ name, network: details.network, ...details.contracts })
  }
  return protocols
}

async function getCurrencies(oracle) {
  const currencies = await query(oracle, { currencies: {} })
  return Array.isArray(currencies) ? currencies : []
}

// Returns the Solana mint address of a currency; the adapter prices everything through it
function getMint(currencies, ticker, protocolName) {
  const currency = currencies.find(c => c?.ticker === ticker)
  if (!currency?.dex_symbol) throw new Error(`[oracle] missing currency info for ${ticker} (${protocolName})`)
  return currency.dex_symbol
}

// Only the available pool balance is counted; borrowed funds are already
// represented by the lease positions on Solana
async function addLppTvl(api, protocol) {
  const ticker = await query(protocol.lpp, { lpn: [] })
  const currencies = await getCurrencies(protocol.oracle)
  const { balance } = await query(protocol.lpp, { lpp_balance: [] })
  api.add(`solana:${getMint(currencies, ticker, protocol.name)}`, Number(balance?.amount || 0), { skipChain: true })
}

async function addLeaseTvl(api, protocol) {
  const currencies = await getCurrencies(protocol.oracle)
  const { config } = await query(protocol.leaser, { config: {} })
  if (!config?.lease_code) throw new Error(`[leaser] missing lease_code for ${protocol.name}`)
  const leases = await queryContracts({ chain: 'nolus', codeId: config.lease_code })
  const states = await queryManyContracts({ contracts: leases, chain: 'nolus', data: { state: {} } })
  for (const state of states) {
    const opened = state?.opened?.amount
    if (!opened) continue
    api.add(getMint(currencies, opened.ticker, protocol.name), opened.amount)
  }
}

module.exports = {
  methodology: 'The combined total of lending pool assets and the current market value of active margin positions',
  hallmarks: [
    ['2026-04-02', 'Neutron market sunset'],
    ['2026-08-27', 'Solana market launch'],
    ['2026-09-07', 'Osmosis market sunset'],
  ],
  nolus: {
    tvl: async (api) => {
      for (const protocol of await getProtocols()) {
        await sleep(300)
        await addLppTvl(api, protocol)
      }
    }
  },
  solana: {
    tvl: async (api) => {
      const protocols = (await getProtocols()).filter(p => p.network === 'Solana')
      for (const protocol of protocols) {
        await sleep(2000)
        await addLeaseTvl(api, protocol)
      }
    }
  }
}
