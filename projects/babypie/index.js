const { PollingWatchKind } = require("typescript");
const config = require("./config");
const sdk = require('@defillama/sdk')




async function tvl(api) {
  const { mbtc } = config[api.chain];

  
   tokenSupply = await api.call({ abi: 'uint256:totalSupply', target: mbtc });


  api.add(mbtc, tokenSupply);
}

module.exports = {
  arbitrum: {
    tvl: tvl,
  },
  ethereum: {
    tvl: tvl,
  },
  bsc: {
    tvl: tvl,
  },
  
};

module.exports.doublecounted = true;
