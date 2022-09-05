const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk")
const { getBlock } = require('../helper/getBlock');


// use fantom to price LIF3 token, tombchain address not on coingecko
const stakingContract = "0x68cDbC441BAD0476db6750D1358F2Ea4dEB0d016"
const LIF3_TOKEN = "fantom:0xbf60e7414ef09026733c1e7de72e7393888c64da"
const stLIF3 = "0x42fc88b94C6C58797D3EA44ED66EEaFFD88E7344"

async function stakingTvl(timestamp, ethBlock, chainBlocks) {  
    const block = await getBlock(timestamp, 'tombchain', chainBlocks);
    const stakedLIF3 = (await sdk.api.abi.call({
        target: stLIF3, 
        params: stakingContract,
        abi: 'erc20:balanceOf',
        block: block,
        chain: 'tombchain'
      })).output
    const balances = {
      [LIF3_TOKEN]: stakedLIF3 
    }
    return balances 
  }

module.exports = {
  misrepresentedTokens: true,
  tombchain: {
    tvl: getUniTVL({
      chain: 'tombchain',
      useDefaultCoreAssets: true,
      factory: '0x69Da8FFe6550A3D78dBff368194d490fB30703f9',
    }),
    staking: stakingTvl
  }
}; // node test.js projects/lif3-swap/index.js
