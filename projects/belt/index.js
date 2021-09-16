const utils = require('../helper/utils');
const sdk = require('@defillama/sdk')

async function bscTvl() {
  let data = await utils.fetchURL('https://s.belt.fi/info/all.json')
  let tvl = 0;    
  data.data.info.BSC.vaults.forEach(e => {
    tvl += parseFloat(e.tvl)
  });
  tvl += parseFloat(data.data.info.BSC.staking.tvl)
  return tvl
}

async function hecoTvl() {
  var data = await utils.fetchURL('https://s.belt.fi/info/all.json')
  let tvl  = 0;    
  data.data.info.HECO.vaults.forEach(e => {
    tvl += parseFloat(e.tvl)
  });
  return tvl
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  heco: {
    tvl: hecoTvl,
  },
  tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl]),
}
