const { PollingWatchKind } = require("typescript");
const config = require("./config");
const sdk = require('@defillama/sdk')




async function tvl(api) {
  const { mbtc,wbtc } = config[api.chain];

  // getting total supply of pegged tokesn
   tokenSupply = await api.call({ abi: 'uint256:totalSupply', target: mbtc });
  //when chain is bsc the decimals of pegged token is 18, but btcb is 8
  if (api.chain === "bsc") {
    tokenSupply = tokenSupply * Math.pow(10, 10);
  }
    

  api.add(wbtc, tokenSupply);
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
