const ADDRESSES = require('../helper/coreAssets.json')
const { getHypercoreStakedHype } = require('../helper/chain/hyperliquid')

const STAKING_VAULT = '0x3F790D0080a5257a1AEfb257DDCDc19579a8998F'

async function tvl(api) {
  await api.sumTokens({ owners: [STAKING_VAULT], tokens: [ADDRESSES.null] })
  api.addGasToken(await getHypercoreStakedHype(STAKING_VAULT))
}

module.exports = {
  timetravel: false,
  hyperliquid: { tvl },
}
