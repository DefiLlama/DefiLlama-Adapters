const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { sumTokens2 } = require('../helper/unwrapLPs');

async function arbitrumTVL(timestamp, block, chainBlocks) {
    let balances = {};

    await sumTokens2({
        balances,
        owners: ["0x3Bb9372989c81d56db64e8aaD38401E677b91244"],
        tokens: ["0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })
}


module.exports = {
  arbitrum:{
    tvl: uniTvlExport("0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC", "arbitrum"),
  },
}