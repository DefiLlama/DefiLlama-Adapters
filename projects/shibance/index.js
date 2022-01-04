const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const sdk = require('@defillama/sdk')

const graphUrls = {
  kcc: 'https://info.shibance.com/subgraphs/name/shibance/exchange-kcc',
  bsc: 'https://api.thegraph.com/subgraphs/name/shibance/exchange-backup'
}
const chainTvl = getChainTvl(graphUrls)

async function bsc(_timestamp, _ethBlock, chainBlocks){
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', '0x092EE062Baa0440B6df6BBb7Db7e66D8902bFdF7', 0, true);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl('kcc'),
  },
  bsc:{
    tvl: bsc
  },
  tvl: sdk.util.sumChainTvls([chainTvl('kcc'), bsc])
}