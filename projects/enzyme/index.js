const retry = require('async-retry')
const axios = require('axios')
const { sumTokens } = require('../helper/unwrapLPs')
const cwADA_ETH = '0x64875aaa68d1d5521666c67d692ee0b926b08b2f'
const cwADA_POLY = 'polygon:0x64875aaa68d1d5521666c67d692ee0b926b08b2f'

async function getData() {
  return retry(async bail => await axios.get('https://app.enzyme.finance/api/v1/network-asset-balances?network=ethereum'))
}

async function tvl(ts, block) {
  const tokens = (await getData()).data
  const tokensAndOwners = []
  const balances = {}
  const vaultsObj = {}
  tokens.forEach(({ id, vaults }) => {
    vaults.forEach(vault => {
      tokensAndOwners.push([id, vault])
      vaultsObj[vault] = true
    })
  })
  await sumTokens(balances, tokensAndOwners, block, undefined, undefined, { resolveCrv: true, resolveLP: true, resolveYearn: true })
  
  if (balances[cwADA_ETH]) {
    balances[cwADA_POLY] = balances[cwADA_ETH]
    delete balances[cwADA_ETH]
  }
  return balances
}

module.exports = {
  timetravel: false,
  ethereum: { tvl },
}
