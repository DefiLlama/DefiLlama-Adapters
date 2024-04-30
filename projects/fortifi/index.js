const { getConfig } = require('../helper/cache')

async function tvl(api) {
    // FortiFi MultiYields route user deposits to various YieldYak farms.
    // This API endpoint calculates the total underlying deposits based on the amount of 
    // YRT being held by each our our MultiYields.
    const farms = await getConfig('fortifi/avax', 'https://api.fortifi.pro/tvl');
    let multiYields = Object.keys(farms);
    let tokens = [];
    let vals = [];

    for (let i = 0; i < multiYields.length; i ++) {
        Object.entries(farms[multiYields[i]]).forEach(strategy => {
            tokens.push(strategy[1].depositToken);
            vals.push(strategy[1].depositTokensLocked);
        })
    }

    tokens.forEach((token, i) => {
      if (!token || !vals[i]) return;
      api.add(token, vals[i])
    })
  }

module.exports = {
  avax: {
    tvl,
  },
}