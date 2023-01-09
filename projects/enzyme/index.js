const { getConfig } = require('../helper/cache')
const { sumTokens } = require('../helper/unwrapLPs')
const cwADA_ETH = '0x64875aaa68d1d5521666c67d692ee0b926b08b2f'
const cwADA_POLY = 'polygon:0x64875aaa68d1d5521666c67d692ee0b926b08b2f'
const cwDOGE_ETH = '0xf9e293d5d793ddc1ae4f778761e0b3e4aa7cf2dd'
const cwDOGE_POLY = 'polygon:0x9bd9ad490dd3a52f096d229af4483b94d63be618'

async function getData() {
  return getConfig('enzyme', 'https://app.enzyme.finance/api/v1/network-asset-balances?network=ethereum')
}

async function tvl(ts, block) {
  const tokens = await getData()
  const tokensAndOwners = []
  const balances = {}
  const vaultsObj = {}
  tokens.forEach(({ id, vaults }) => {
    vaults.forEach(vault => {
      tokensAndOwners.push([id, vault])
      vaultsObj[vault] = true
    })
  })
  await sumTokens(balances, tokensAndOwners, block,)
  
  if (balances[cwADA_ETH]) {
    balances[cwADA_POLY] = balances[cwADA_ETH]
    delete balances[cwADA_ETH]
  }

  if (balances[cwDOGE_ETH]) {
    balances[cwDOGE_POLY] = balances[cwDOGE_ETH]
    delete balances[cwDOGE_ETH]
  }
  return balances
}

module.exports = {
  timetravel: false,
  ethereum: { tvl }
}
