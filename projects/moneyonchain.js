// Money on Chain exists on the RSK chain
// Based on four tokens:
// The DoC, a USD price pegged Stablecoin token.
// The BPro (Bitpro) a token designed for BTC hodlers, to earn a rent on Bitcoin and gain free leverage.
// The BTCx, a token that represents a leveraged long bitcoin holding position.
// The MoC token, designed to govern a decentralized autonomous organization (DAO) that will govern the Smart Contracts.


// Various API endpoints: https://api.moneyonchain.com/api/report/

// stats from https://moneyonchain.com/stats/
const { get } = require('./helper/http')
let data

async function getData() {
  if (!data) data = get('https://api.moneyonchain.com/api/calculated/TVL')
  return data
}

async function tvl() {
  const { btc_in_moc, btc_in_roc } = await getData()
  return {
    'rootstock': btc_in_moc + btc_in_roc
  }
}

module.exports = {
  timetravel: false,
  rsk: {
    tvl,
  }
}