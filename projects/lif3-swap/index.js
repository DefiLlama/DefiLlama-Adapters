const { getUniTVL } = require('../helper/unknownTokens')

// use fantom to price LIF3 token, tombchain address not on coingecko
const stakingContract = "0x68cDbC441BAD0476db6750D1358F2Ea4dEB0d016"
const LIF3_TOKEN = "fantom:0xbf60e7414ef09026733c1e7de72e7393888c64da"
const stLIF3 = "0x42fc88b94C6C58797D3EA44ED66EEaFFD88E7344"

async function stakingTvl(api) {
  const stakedLIF3 = await api.call({
    target: stLIF3,
    params: stakingContract,
    abi: 'erc20:balanceOf',
  })
  return {
    [LIF3_TOKEN]: stakedLIF3
  }
}

module.exports = {
  misrepresentedTokens: true,
  tombchain: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x69Da8FFe6550A3D78dBff368194d490fB30703f9', }),
    staking: stakingTvl
  },
  bsc: {    tvl: getUniTVL({ factory: '0x3FB1E7D5d9C974141A5B6E5fa4edab0a7Aa15C6A', useDefaultCoreAssets: true, })  },
  polygon: {    tvl: getUniTVL({ factory: '0x3FB1E7D5d9C974141A5B6E5fa4edab0a7Aa15C6A', useDefaultCoreAssets: true, })  },
}; // node test.js projects/lif3-swap/index.js
